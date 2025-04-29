"Main program application"
from functools import wraps
import datetime
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
import mysql.connector
from queries import (
    get_person_data,
    get_group_data,
    search_people_by_name,
    get_followed_papers,
    get_following,
    get_person_by_id,
    get_starred_papers,
    get_paper_data,
    insert_comment,
    get_recent_papers,
    is_paper_starred,
    get_random_authors,
)
from database_defs import (
    Comments,
    Papers,
    DiscussionGroups,
    GroupMembers,
    People,
    StarredPapers,
)
from sqlalchemy.orm import sessionmaker
from database_defs import engine
from flask_session import Session
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from flask_bcrypt import Bcrypt

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'research_pulse_secret_key'
app.config['JWT_SECRET_KEY'] = 'research_pulse_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)
Session = sessionmaker(bind=engine)
bcrypt = Bcrypt(app)

# Database connection
def get_db_connection():
    "function to get db connection"
    return mysql.connector.connect(
        host="researchpulse.cbkkuyoa4oz7.us-east-2.rds.amazonaws.com",
        user="admin",
        password="c0eYBliLpdHULPaktvSE",
        database="researchpulse",
        port=3306
    )

# Token requirements for holding each sesssion, used for authentication
def token_required(f):
    "function for token requirements"
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = data['person_id']
        except (ExpiredSignatureError, InvalidTokenError) as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/refresh', methods=['POST'])
@token_required
def refresh_token(current_user):
    "function for refresh token"
    new_token = jwt.encode({
        'person_id': current_user,
        'exp': datetime.datetime.now(datetime.timezone.utc) + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['JWT_SECRET_KEY'])

    return jsonify({
        'success': True,
        'token': new_token
    }), 200

#default thing for signup, ignore
test_users = {}

@app.route('/signup', methods=['POST'])
def signup():
    "function for signup"
    data = request.get_json()

    # Extract the data
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    username = data.get('username')
    password = data.get('password')

    if not first_name or not last_name or not username or not password:
        return jsonify({'success': False, 'error': "Missing required fields"}), 400

    # You can assign a default institution or leave it null
    institution_id = None  # Or you can set a default institution ID if necessary

    # Create a new person
    conn = get_db_connection()
    cursor = conn.cursor()

    # Insert new person into the people table
    cursor.execute(
        "INSERT INTO people (first_name, last_name, institution_id) VALUES (%s, %s, %s)",
        (first_name, last_name, institution_id)
    )
    conn.commit()

    # Check if the person was inserted by fetching the last inserted person_id
    person_id = cursor.lastrowid  # Get the person_id of the newly created person

    if not person_id:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': "Failed to create person"}), 500

    # Debug: Verify the person was inserted
    print(f"Inserted person with person_id: {person_id}")

    # Hash the password correctly using bcrypt instance
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    # Insert into the user_login table
    cursor.execute(
        "INSERT INTO user_login (person_id, username, password_hash) VALUES (%s, %s, %s)",
        (person_id, username, password_hash)
    )
    conn.commit()

    cursor.close()
    conn.close()

    # Verify user insertion by checking the user_login table
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM user_login WHERE person_id = %s", (person_id,))
    user = cursor.fetchone()

    if user:
        return jsonify({'success': True, 'person_id': person_id, 'username': username}), 201

    return jsonify({'success': False, 'error': "Failed to create user login"}), 500

@app.route('/login', methods=['POST'])
def login_user():
    "function for login user"
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'error': "Missing credentials"}), 400

    # Debug: Print the username being used
    print(f"Attempting to login with username: {username}")

    # Check if the username exists
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # Use dictionary=True to return rows as dictionaries

    # Debug: Print the query being executed
    print(f"Executing query: SELECT * FROM user_login WHERE username = {username}")

    cursor.execute("SELECT * FROM user_login WHERE username = %s", (username,))

    # Consume the result of the first query (fetch the user)
    user = cursor.fetchone()

    # Debug: Print the result of the query
    print(f"Query result: {user}")

    if not user:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': "Invalid username"}), 401

    # Check if password is correct
    if not bcrypt.check_password_hash(user['password_hash'], password):
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': "Invalid password"}), 401

    person_id = user['person_id']
    cursor.execute("SELECT * FROM people WHERE person_id = %s", (person_id,))
    person = cursor.fetchone()

    cursor.close()
    conn.close()

    if not person:
        return jsonify({'success': False, 'error': "Person not found"}), 404

    # Create JWT token
    token = jwt.encode({
        'person_id': person_id,
        'exp': datetime.datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['JWT_SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'success': True,
        'token': token,
        'person_id': person_id
    }), 200

@app.route('/check-orcid', methods=['POST'])
def check_orcid():
    "function for check orcid"
    data = request.get_json()
    orcid_id = data.get('orcid_id')

    if not orcid_id:
        return jsonify({'success': False, 'error': 'ORCID ID is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # Use dictionary=True to return rows as dictionaries
    cursor.execute("SELECT * FROM people WHERE orcid_id = %s", (orcid_id,))
    author = cursor.fetchone()
    cursor.close()
    conn.close()

    if not author:
        return jsonify({'success': False, 'error': 'Author not found'}), 404

    return jsonify({'success': True, 'person_id': author['person_id']}), 200


@app.route('/signup-author', methods=['POST'])
def signup_author():
    "function for signup for authors"
    data = request.get_json()

    orcid_id = data.get('orcid_id')
    username = data.get('username')
    password = data.get('password')

    if not orcid_id or not username or not password:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if the user already exists
    cursor.execute("SELECT * FROM people WHERE orcid_id = %s", (orcid_id,))
    person = cursor.fetchone()

    if not person:
        return jsonify({'success': False, 'error': 'Invalid ORCID ID'}), 400

    person_id = person['person_id']  # Access person_id as a dictionary key

    # Insert into UserLogin table
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    cursor.execute(
        "INSERT INTO user_login (person_id, username, password_hash) VALUES (%s, %s, %s)",
        (person_id, username, password_hash)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'success': True, 'person_id': person_id}), 201

@app.route('/dashboard')
@token_required
def dashboard(person_id):
    "function for dashboard"
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get user info
        cursor.execute("SELECT * FROM people WHERE person_id = %s", (person_id,))
        person = cursor.fetchone()

        if not person:
            return jsonify({'success': False, 'error': 'Invalid user'}), 401

        # Get following
        following_list = get_following(cursor, person_id)

        # Get starred papers
        starred_papers = get_starred_papers(cursor, person_id)

        person = get_person_data(person_id)

        return jsonify({
            'success': True,
            'person_id': person_id,
            'person_dict': person,
            'name': f"{person['first_name']} {person['last_name']}",
            'following': following_list,
            'starredPapers': starred_papers,
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/deprecated_dashboard')
def deprecated_dashboard():
    "function for deprecated dashboard"
    if 'person_id' not in session:
        return redirect(url_for('index'))

    # Get random papers for discover feed - only titles
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT title FROM papers ORDER BY RAND() LIMIT 5")
    random_papers = cursor.fetchall()

    search_result = None
    search_error = None
    if 'search_id' in request.args:
        person_id = request.args.get('search_id')
        cursor.execute("SELECT * FROM people WHERE person_id = %s", (person_id,))
        search_result = cursor.fetchone()

        if search_result and person_id != session['person_id']:
            # Add follower relationship
            cursor.execute(
                "INSERT IGNORE INTO people_following (person_id, follower_id) VALUES (%s, %s)",
                (person_id, session['person_id']),
            )
            conn.commit()
        elif not search_result:
            search_error = f"No person found with ID: {person_id}"

    cursor.execute("""
        SELECT p.* FROM people p
        JOIN people_following pf ON p.person_id = pf.person_id
        WHERE pf.follower_id = %s
    """, (session['person_id'],))
    following = cursor.fetchall()

    cursor.execute("""
        SELECT p.title, p.paper_id, pe.first_name, pe.last_name 
        FROM papers p
        JOIN authors a ON p.paper_id = a.paper_id
        JOIN people pe ON a.author_id = pe.person_id
        JOIN people_following pf ON pe.person_id = pf.person_id
        WHERE pf.follower_id = %s
        ORDER BY p.publication_date DESC
    """, (session['person_id'],))
    followed_papers = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template('dashboard.html', random_papers=random_papers,
                           search_result=search_result, search_error=search_error,
                           following=following, followed_papers=followed_papers)

@app.route('/', methods=['GET', 'POST'])
def index():
    "function for index"
    if request.method == 'POST':
        person_id = request.form['person_id']

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM people WHERE person_id = %s", (person_id,))
        person = cursor.fetchone()
        cursor.close()
        conn.close()

        if person:
            session['person_id'] = person_id
            session['name'] = f"{person['first_name']} {person['last_name']}"
            return redirect(url_for('deprecated_dashboard'))

        return render_template('login.html', error='Invalid Person ID')

    return render_template('login.html')

@app.route('/followedpapers', methods=['POST'])
def followedPapers():
    "function for followed papers"
    data = request.get_json()
    person_id = data.get('id')

    if not person_id:
        print("Missing person_id in request data")
        return jsonify([])

    try:
        db_session = Session()  # Single session created here
        papers = get_followed_papers(db_session, person_id)
        return jsonify(papers)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/search_user', methods=['GET'])
def search_user():
    "function for search user"
    full_name = request.args.get('name')
    if not full_name:
        return jsonify({'error': 'Name parameter is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        users = search_people_by_name(cursor, full_name)

        users_list = []
        for user in users:
            users_list.append({
                'person_id': user['person_id'],
                'first_name': user['first_name'],
                'last_name': user['last_name']
            })

        return jsonify(users_list), 200

    except Exception as e:
        print(f"Error searching user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/following', methods=['POST'])
def following():
    "function for following"
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    following = get_following(cursor, data['id'])

    cursor.close()
    conn.close()

    return following

@app.route('/starred_papers', methods=['GET'])
def get_starred_papers(cursor, person_id):
    "function for get starred papers"
    cursor.execute("""
        SELECT p.title, p.paper_id, pe.first_name, pe.last_name 
        FROM papers p
        JOIN starred_papers sp ON p.paper_id = sp.paper_id
        JOIN people pe ON sp.person_id = pe.person_id
        WHERE sp.person_id = %s
        ORDER BY p.publication_date DESC
    """, (person_id,))
    return cursor.fetchall()

@app.route('/follow', methods=['POST'])
def follow():
    "function for follow"
    data = request.get_json()
    print(f"Received follow request: {data}")  # Log the received data

    follower_id = data.get('person_id')  # Current user (follower)
    followee_id = data.get('user_id')    # User to follow

    # Check if the user is trying to follow themselves
    if follower_id == followee_id:
        return jsonify({"error": "You cannot follow yourself"}), 400

    if not follower_id or not followee_id:
        return jsonify({"error": "Missing person_id or user_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT * FROM people_following WHERE person_id = %s AND follower_id = %s",
            (followee_id, follower_id),
        )
        follow_exists = cursor.fetchone()

        if follow_exists:
            return jsonify({"error": "You are already following this user"}), 400

        cursor.execute(
            "INSERT INTO people_following (person_id, follower_id) VALUES (%s, %s)",
            (followee_id, follower_id),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": f"You are now following user {followee_id}"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/unfollow', methods=['POST'])
def unfollow():
    "function to unfollow users"
    data = request.get_json()
    follower_id = data.get('person_id')
    followee_id = data.get('user_id')

    if not follower_id or not followee_id:
        return jsonify({'error': 'Missing person_id or user_id'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Delete the follow relationship
    cursor.execute(
        "DELETE FROM people_following WHERE person_id = %s AND follower_id = %s",
        (followee_id, follower_id)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'message': f'You have unfollowed user {followee_id}.'})

@app.route('/group/<group_id>/members', methods=['GET'])
def get_group_members(group_id):
    "function to get group members"
    # Create a new session instance
    session_db = Session()  # This is the SQLAlchemy session, not the Flask session

    try:
        # Now use the session_db for queries
        members = (
            session_db.query(People)
            .join(GroupMembers, People.person_id == GroupMembers.person_id)
            .filter(GroupMembers.group_id == group_id)
            .all()
        )

        # Return the members
        return jsonify({
            'success': True,
            'members': [{
                'person_id': m.person_id,
                "first_name": m.first_name,
                "last_name": m.last_name,
            } for m in members]
        })

    except Exception as e:
        # Handle any errors
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        # Close the session
        session_db.close()

@app.route('/join_group', methods=['POST'])
def join_group():
    "function to join group"
    try:
        data = request.get_json()
        group_id = data.get('group_id')
        person_id = data.get('person_id')

        if not group_id:
            return "Error: group_id not provided", 400

        db = Session()
        group = db.query(DiscussionGroups).get(group_id)

        if not group:
            return jsonify({'success': False, 'message': 'Group not found'}), 404

        member = GroupMembers(group_id=group_id, person_id=person_id)
        db.add(member)
        db.commit()

        return jsonify({'success': True, 'message': 'Successfully joined group'})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/leave_group', methods=['POST'])
def leave_group():
    "function to leave group"
    try:
        data = request.get_json()
        group_id = data.get('group_id')
        person_id = data.get('person_id')

        if not group_id:
            return "Error: group_id not provided", 400

        db = Session()
        group = db.query(DiscussionGroups).get(group_id)

        if not group:
            return jsonify({'success': False, 'message': 'Group not found'}), 404

        member = GroupMembers(group_id=group_id, person_id=person_id)
        db.delete(member)
        db.commit()

        return jsonify({'success': True, 'message': 'Successfully left group'})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/star_paper', methods=['POST'])
def star_paper():
    "function to star paper"
    data = request.get_json()
    person_id = data.get('person_id')
    paper_id = data.get('paper_id')

    if not person_id or not paper_id:
        return jsonify({"error": "Error: person_id or paper_id not provided"}), 400

    session_db = Session()
    user = session_db.query(People).filter_by(person_id=person_id).first()
    paper = session_db.query(Papers).filter_by(paper_id=paper_id).first()

    if not user or not paper:
        session_db.close()
        return jsonify({"error": "Error: User or Paper not found"}), 404

    # Check if the paper is already starred by the user
    existing_starred = (
        session_db.query(StarredPapers)
        .filter_by(person_id=person_id, paper_id=paper_id)
        .first()
    )
    if existing_starred:
        session_db.close()
        return jsonify({"message": "You have already starred this paper."}), 200

    # Star the paper
    starred_paper = StarredPapers(person_id=person_id, paper_id=paper_id)
    session_db.add(starred_paper)
    session_db.commit()

    # Get the paper's title
    paper_title = paper.title  # Ensure the title exists

    session_db.close()

    return jsonify({
        "success": True,
        "paper": {
            "title": paper_title,
            "paperId": paper.paper_id
        }
    }), 200

@app.route('/unstar_paper', methods=['POST'])
def unstar_paper():
    "function to unstar paper"
    data = request.get_json()
    person_id = data.get('person_id')
    paper_id = data.get('paper_id')

    if not person_id or not paper_id:
        return jsonify({"error": "person_id or paper_id not provided"}), 400

    session_db = Session()
    user = session_db.query(People).filter_by(person_id=person_id).first()
    paper = session_db.query(Papers).filter_by(paper_id=paper_id).first()

    if not user or not paper:
        session_db.close()
        return jsonify({"error": "User or Paper not found"}), 404

    starred_paper = (
        session_db.query(StarredPapers)
        .filter_by(person_id=person_id, paper_id=paper_id)
        .first()
    )
    if not starred_paper:
        session_db.close()
        return jsonify({"error": "This paper is not starred"}), 400

    session_db.delete(starred_paper)
    session_db.commit()
    session_db.close()

    # Return a success response with the updated 'starred' state
    return jsonify({"success": True, "starred": False}), 200


@app.route('/user/<person_id>', methods=['GET'])
def get_user(person_id):
    "function to get user id"
    user = get_person_by_id(person_id)
    if user:
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404

@app.route('/group/<group_id>', methods=["GET"])
def get_group_route(group_id):
    """API endpoint to get group data by ID."""
    group_data = get_group_data(group_id)

    if group_data:
        return jsonify(group_data)
    else:
        return jsonify({"error": "Group not found"}), 404

@app.route('/paper/<paper_id>')
def get_paper_route(paper_id):
    "function for individual paper"
    db_session = Session()  # Single session created here

    # Call the function to get paper data. It should return a dictionary with the necessary fields
    try:
        paper_data = get_paper_data(db_session, paper_id)

        # Check if paper_data is not None and contains the required fields
        if not paper_data:
            return jsonify({"error": "Paper not found"}), 404

        # Ensure the paper_data contains the keys you expect
        paper = paper_data.get("paper")
        authors = paper_data.get("authors", [])
        comments = paper_data.get("comments", [])
        starred_by = paper_data.get("starred_by", [])

        # Return the data in the correct structure
        return jsonify({
            "paper": paper,
            "authors": authors,
            "comments": comments,
            "starred_by": starred_by
        })

    except Exception as e:
        # Handle unexpected errors
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    finally:
        db_session.close()  # Properly close session when done

# Route to add a comment
@app.route('/paper/<paper_id>/comment', methods=['POST'])
def add_comment(paper_id):
    "function to add comment"
    try:
        # Extract form data
        data = request.get_json()
        person_id = data.get('person_id')
        comment_text = data.get('comment_text')
        date = data.get('date')

        # Add comment to the database (assuming insert_comment is implemented)
        new_comment = insert_comment(paper_id, person_id, comment_text, date)
        user = get_person_data(person_id)

        return jsonify({
            "success": True,
            "comment_id": new_comment.comment_id,
            "first_name": user['first_name'],
            "last_name": user['last_name'],
            "person_id": new_comment.person_id,
            "comment_text": new_comment.comment_text
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete_comment', methods=['POST'])
def delete_comment():
    "function to delete comment"
    try:
        data = request.get_json()  # Get the JSON data from the request
        comment_id = data.get('comment_id')  # Extract comment_id
        paper_id = data.get('paper_id')      # Extract paper_id

        if not comment_id:
            return jsonify({"error": "Missing comment ID"}), 400

        if not paper_id:
            return jsonify({"error": "Missing paper ID"}), 400

        # Find the comment based on comment_id
        comment = (
            session.query(Comments)
                .filter(
                    Comments.comment_id == comment_id,
                    Comments.paper_id == paper_id,
                )
                .first()
            )
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        session.delete(comment)  # Delete the comment
        session.commit()  # Commit the deletion
        return jsonify({"success": True}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return error if any other issue occurs

# Route to discover recent papers
@app.route('/api/recent_papers', methods=['GET'])
@token_required
def api_recent_papers(current_user):
    "function to discover recent papers"
    try:
        session = Session()
        conn = get_db_connection()
        cursor = conn.cursor()
        papers = get_recent_papers(session, cursor, current_user)
        for p in papers:
            p["starred"] = is_paper_starred(current_user, p["paperId"])

        return jsonify({"success": True, "papers": papers})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        session.close()


@app.route('/api/new_authors', methods=['GET'])
def api_random_authors():
    "function to get random authors"
    session = Session()
    try:
        authors_list = get_random_authors(session, limit=10)
        return jsonify({"success": True, "authors": authors_list})
    except Exception as e:
        print(f"Error fetching random authors: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        session.close()

@app.route('/logout', methods=['POST'])
def logout():
    "function to logout"
    # Clear the session
    session.pop('person_id', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
