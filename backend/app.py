from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
import mysql.connector
from queries import get_person_data, get_group_data, insert_following, insert_group_member, get_discussion_groups, get_following, get_group_by_id, get_person_by_id, get_random_papers, get_starred_papers
from database_defs import Papers, People, Authors, DiscussionGroups, GroupMembers, PeopleFollowing, StarredPapers
from sqlalchemy.orm import sessionmaker
from database_defs import engine

app = Flask(__name__)
app.secret_key = 'research_pulse_secret_key'
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
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error='Invalid Person ID')
            
    return render_template('login.html')

@app.route('/dashboard', methods=['GET'])
def dashboard():
    # Ensure the user is logged in
    if 'person_id' not in session:
        return redirect(url_for('index'))

    # Get random papers for discover feed - only titles
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    random_papers = get_random_papers(cursor)

    # Get following list
    following = get_following(cursor, session['person_id'])

    # Get starred papers
    starred_papers = get_starred_papers(cursor, session['person_id'])

    # Get the user's discussion groups
    discussion_groups = get_discussion_groups(cursor, session['person_id'])

    cursor.close()
    conn.close()

    return render_template('dashboard.html', random_papers=random_papers, 
                           following=following, starred_papers=starred_papers, discussion_groups=discussion_groups)

@app.route('/follow', methods=['POST'])
def follow():
    if 'person_id' not in session:
        return redirect(url_for('index'))

    # Get the person_id from the form data
    person_id = request.form.get('person_id')

    if not person_id:
        return "Error: person_id not provided", 400

    # 'person_id' is the person to be followed, and 'session['person_id']' is the current user (follower)
    follower_id = session['person_id']
    
    # Insert into 'people_following' table
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(insert_following(person_id, follower_id), (person_id, follower_id))
    conn.commit()

    cursor.close()
    conn.close()

    flash(f"You are now following the person with ID: {person_id}")

    return redirect(request.referrer)

@app.route('/unfollow', methods=['POST'])
def unfollow():
    # Get the person_id from the form data
    person_id = request.form.get('person_id')

    if not person_id:
        return "Error: person_id not provided", 400

    # 'user_id' is the ID of the currently logged-in user (fetch it from session or wherever)
    user_id = session.get('person_id') 

    if not user_id:
        return "Error: user not logged in", 400  # Or handle as necessary

    # Query to find the follow relationship in the database
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if the follow relationship exists
    cursor.execute("""
        SELECT * FROM people_following WHERE person_id = %s AND follower_id = %s
    """, (person_id, user_id))
    follow_record = cursor.fetchone()

    # If the follow record exists, remove it
    if follow_record:
        cursor.execute("""
            DELETE FROM people_following WHERE person_id = %s AND follower_id = %s
        """, (person_id, user_id))
        conn.commit()
        message = f'You have unfollowed {person_id}'
    else:
        message = f'You are not following this user with ID: {person_id}'

    cursor.close()
    conn.close()

    flash(message)
    
    return redirect(request.referrer)

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
    # Get the person_id and paper_id from the form data or request
    person_id = session.get('person_id')
    paper_id = request.form.get('paper_id')

    if not person_id or not paper_id:
        return "Error: person_id or paper_id not provided", 400

    # Assuming 'user_id' is the ID of the currently logged-in user
    user_id = session.get('person_id')  # Or wherever you store the current user's ID

    if not user_id:
        return "Error: user not logged in", 400

    # Start a session and check if the user and paper exist
    session_db = Session()
    user = session_db.query(People).filter_by(person_id=user_id).first()
    paper = session_db.query(Papers).filter_by(paper_id=paper_id).first()

    if not user or not paper:
        session_db.close()  # Always close session when done
        return "Error: User or Paper not found", 404

    # Check if the paper is already starred by the user
    existing_starred = session_db.query(StarredPapers).filter_by(person_id=user_id, paper_id=paper_id).first()

    if existing_starred:
        session_db.close()  # Close the session
        return "This paper is already starred by the user", 400

    # Add the paper to the starred papers list by creating a new StarredPapers entry
    starred_paper = StarredPapers(person_id=user_id, paper_id=paper_id)
    session_db.add(starred_paper)
    session_db.commit()

    session_db.close()  # Close session after commit
    return redirect(request.referrer)

@app.route('/unstar_paper', methods=['POST'])
def unstar_paper():
    # Get the person_id and paper_id from the form data or request
    person_id = session.get('person_id')
    paper_id = request.form.get('paper_id')

    if not person_id or not paper_id:
        return "Error: person_id or paper_id not provided", 400

    # Start a session and check if the user and paper exist
    session_db = Session()
    user = session_db.query(People).filter_by(person_id=person_id).first()
    paper = session_db.query(Papers).filter_by(paper_id=paper_id).first()

    if not user or not paper:
        return "Error: User or Paper not found", 404

    # Check if the paper is starred by the user
    starred_paper = session_db.query(StarredPapers).filter_by(person_id=person_id, paper_id=paper_id).first()

    if not starred_paper:
        return "This paper is not starred by the user", 400

    # Remove the paper from the starred papers list
    session_db.delete(starred_paper)
    session_db.commit()
    return redirect(request.referrer)

@app.route('/id/', defaults={'person_id': None})
@app.route('/id/<person_id>', methods=["GET"])
def get_person_route(person_id):
    """API endpoint to get person data by ID."""
    person_data = get_person_data(person_id)
    
    if person_data:
        return render_template('person_id.html', person=person_data)
    else:
        return jsonify({"error": "Person not found"}), 404

@app.route('/group/<group_id>', methods=["GET"])
def get_group_route(group_id):
    """API endpoint to get group data by ID."""
    group_data = get_group_data(group_id)
    
    if group_data:
        return render_template('group_id.html', group=group_data)
    else:
        return jsonify({"error": "Group not found"}), 404
    
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)