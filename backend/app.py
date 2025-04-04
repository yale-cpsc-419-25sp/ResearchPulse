from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from flask_cors import CORS
import mysql.connector
from queries import get_person_data, get_group_data, insert_following, insert_group_member, get_discussion_groups, get_following, get_group_by_id, get_person_by_id, get_random_papers, get_starred_papers, get_paper_data, insert_comment, get_recent_papers, is_paper_starred, get_random_authors
from database_defs import Papers, Authors, People, StarredPapers
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from database_defs import engine
from flask_session import Session
import jwt
import datetime
from functools import wraps

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'research_pulse_secret_key'
app.config['JWT_SECRET_KEY'] = 'research_pulse_secret_key'  # Change this!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)
Session = sessionmaker(bind=engine)

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="researchpulse.cbkkuyoa4oz7.us-east-2.rds.amazonaws.com",
        user="admin",
        password="c0eYBliLpdHULPaktvSE",
        database="researchpulse",
        port=3306
    )

# Token requirements for holding each sesssion, used for authentication
def token_required(f):
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
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/refresh', methods=['POST'])
@token_required
def refresh_token(current_user):
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
    data = request.get_json()
    user_id = data.get('person_id')

    if not user_id:
        return jsonify({'success': False, "error": "Missing required fields"}), 400

    test_users[user_id] = {
        'first_name': 'Test',# Default values for testing, ignore for now
        'last_name': 'User'
    }

    return jsonify({
        'success': True,
        'person_id': user_id
    }), 201

@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    person_id = data.get('person_id')

    if not person_id:
        return jsonify({'success': False,"error": "Missing credentials"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM people WHERE person_id = %s", (person_id,))
    person = cursor.fetchone()
    cursor.close()
    conn.close()

    if not person:
        return jsonify({'success': False,"error": "Invalid Person ID"}), 401
    
    # Create JWT token
    token = jwt.encode({
        'person_id': person_id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['JWT_SECRET_KEY'])
    
    return jsonify({
        'success': True,
        'token': token,
        'person_id': person_id
    }), 200

@app.route('/dashboard')
@token_required
def dashboard(person_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get user info
        cursor.execute("SELECT * FROM people WHERE person_id = %s", (person_id,))
        person = cursor.fetchone()

        if not person:
            return jsonify({'success': False, 'error': 'Invalid user'}), 401

        # Get following
        following = get_following(cursor, person_id)
        
        # Get starred papers
        starred_papers = get_starred_papers(cursor, person_id)

        #TODO: Add more user info here and make sure to jsonify it below
        person = get_person_data(person_id)

        return jsonify({
            'success': True,
            'person_id': person_id,
            'person_dict': person,
            'name': f"{person['first_name']} {person['last_name']}",
            'following': following,
            'starredPapers': starred_papers,
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
        
    finally:
        cursor.close()
        conn.close()

@app.route('/deprecated_dashboard')
def deprecated_dashboard():
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
            cursor.execute("INSERT IGNORE INTO people_following (person_id, follower_id) VALUES (%s, %s)", 
                          (person_id, session['person_id']))
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
        else:
            return render_template('login.html', error='Invalid Person ID')
            
    return render_template('login.html')

@app.route('/following', methods=['POST'])
def following():

    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    following = get_following(cursor, data['id'])

    cursor.close()
    conn.close()

    return following

@app.route('/starred_papers', methods=['GET'])
def get_starred_papers(cursor, person_id):
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
    data = request.get_json()
    print(f"Received follow request: {data}")  # Log the received data

    follower_id = data.get('person_id')  # Current user (follower)
    followee_id = data.get('user_id')    # User to follow

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


@app.route('/join_group', methods=['POST'])
def join_group():
    if 'person_id' not in session:
        return redirect(url_for('index'))

    # Get the group_id from the form data
    group_id = request.form.get('group_id')

    if not group_id:
        return "Error: group_id not provided", 400

    # 'group_id' is the group to be joined, and 'session['person_id']' is the current user
    person_id = session['person_id']

    # Insert into 'group_members' table
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(insert_group_member(group_id, person_id), (group_id, person_id))
    conn.commit()

    cursor.close()
    conn.close()

    flash(f"You have successfully joined the group with ID: {group_id}")

    return redirect(request.referrer)

@app.route('/leave_group', methods=['POST'])
def leave_group():
    """Function to allow users to leave a group"""
    # Get the group_id from the form data
    group_id = request.form.get('group_id')

    if not group_id:
        return "Error: group_id not provided", 400

    # 'user_id' is the ID of the currently logged-in user (fetch it from session or wherever)
    user_id = session.get('person_id')

    if not user_id:
        return "Error: user not logged in", 400  # Or handle as necessary

    # Query to find the group membership in the database
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if the user is a member of the group
    cursor.execute("""
        SELECT * FROM group_members WHERE group_id = %s AND person_id = %s
    """, (group_id, user_id))
    group_member_record = cursor.fetchone()

    # If the user is a member, remove them from the group
    if group_member_record:
        cursor.execute("""
            DELETE FROM group_members WHERE group_id = %s AND person_id = %s
        """, (group_id, user_id))
        conn.commit()
        message = f'You have left the group with ID: {group_id}'
    else:
        message = f'You are not a member of the group with ID: {group_id}'

    cursor.close()
    conn.close()

    flash(message)
    
    return redirect(request.referrer)

@app.route('/star_paper', methods=['POST'])
def star_paper():
    data = request.get_json()
    person_id = data.get('person_id')
    paper_id = data.get('paper_id')

    if not person_id or not paper_id:
        return jsonify({"error": "Error: person_id or paper_id not provided"}), 400

    # Assuming user_id is from session or input
    session_db = Session()
    user = session_db.query(People).filter_by(person_id=person_id).first()
    paper = session_db.query(Papers).filter_by(paper_id=paper_id).first()

    if not user or not paper:
        session_db.close()
        return jsonify({"error": "Error: User or Paper not found"}), 404

    existing_starred = session_db.query(StarredPapers).filter_by(person_id=person_id, paper_id=paper_id).first()
    if existing_starred:
        session_db.close()
        return jsonify({"error": "This paper is already starred by the user"}), 400

    starred_paper = StarredPapers(person_id=person_id, paper_id=paper_id)
    session_db.add(starred_paper)
    session_db.commit()
    session_db.close()

    return jsonify({"message": "Paper starred successfully!"}), 200

@app.route('/unstar_paper', methods=['POST'])
def unstar_paper():
    # Get the person_id and paper_id from the request JSON
    data = request.get_json()
    person_id = data.get('person_id')
    paper_id = data.get('paper_id')

    if not person_id or not paper_id:
        return jsonify({"error": "Error: person_id or paper_id not provided"}), 400

    # Start a session and check if the user and paper exist
    session_db = Session()
    user = session_db.query(People).filter_by(person_id=person_id).first()
    paper = session_db.query(Papers).filter_by(paper_id=paper_id).first()

    if not user or not paper:
        session_db.close()
        return jsonify({"error": "Error: User or Paper not found"}), 404

    # Check if the paper is starred by the user
    starred_paper = session_db.query(StarredPapers).filter_by(person_id=person_id, paper_id=paper_id).first()

    if not starred_paper:
        session_db.close()
        return jsonify({"error": "This paper is not starred by the user"}), 400

    # Remove the paper from the starred papers list
    session_db.delete(starred_paper)
    session_db.commit()
    session_db.close()

    return jsonify({"message": "Paper unstarred successfully!"}), 200


@app.route('/user/<person_id>', methods=['GET'])
def get_user(person_id):
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
    db_session = Session()  # Single session created here
    paper_data = get_paper_data(db_session, paper_id)  # Pass session
    db_session.close()  # Properly close session when done

    if paper_data:
        return jsonify({
            "paper": paper_data["paper"],
            "authors": paper_data["authors"],
            "comments": paper_data["comments"],
            "starred_by": paper_data["starred_by"]
        })
    else:
        return jsonify({"error": "Paper not found"}), 404

# Route to add a comment
@app.route('/paper/<paper_id>/comment', methods=['POST'])
def add_comment(paper_id):
    try:
        # Extract form data
        data = request.get_json()
        person_id = data.get('person_id')
        comment_text = data.get('comment_text')
        date = data.get('date')

        # Insert comment into the database (assumes insert_comment is implemented)
        insert_comment(paper_id, person_id, comment_text, date)

        return jsonify({"success": True}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to discover recent papers
@app.route('/api/recent_papers', methods=['GET'])
@token_required
def api_recent_papers(current_user):
    try:
        session = Session()
        papers = get_recent_papers(session, current_user)
        for p in papers:
            p["starred"] = is_paper_starred(current_user, p["paperId"])

        return jsonify({"success": True, "papers": papers})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        session.close()


@app.route('/api/new_authors', methods=['GET'])
def api_random_authors():
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
    session.pop('person_id')
    return '200'

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)