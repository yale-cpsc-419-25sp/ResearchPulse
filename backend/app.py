from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import mysql.connector


app = Flask(__name__)
app.secret_key = 'research_pulse_secret_key'

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

@app.route('/dashboard')
def dashboard():
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

    group_result = None
    group_error = None
    if 'group_id' in request.args:
    
        group_id = request.args.get('group_id')

        cursor.execute("SELECT * FROM discussion_groups WHERE group_id = %s", (group_id,))
        group_result = cursor.fetchone()
        print(group_result)

        if group_result:
            cursor.execute("INSERT IGNORE INTO group_members (group_id, person_id) VALUES (%s, %s)",
                           (group_id, session['person_id']))
            conn.commit()
        elif not group_result:
            group_error = f"No group found with ID: {group_id}"

    cursor.execute("""
        SELECT gp.* FROM discussion_groups gp
        JOIN group_members gm ON gp.group_id = gm.group_id
        WHERE gm.person_id = %s
    """, (session['person_id'],))
    discussion_groups = cursor.fetchall()

    print("Discussion Groups:", discussion_groups)

    cursor.close()
    conn.close()
    
    return render_template('dashboard.html', random_papers=random_papers, 
                           search_result=search_result, search_error=search_error, group_error=group_error,
                           following=following, followed_papers=followed_papers, discussion_groups=discussion_groups)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)