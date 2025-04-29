"""Program for database queries"""
from datetime import datetime
import numpy as np
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, func
from sqlalchemy.exc import SQLAlchemyError
from database_defs import(
    Papers,
    People,
    Authors,
    Institutions,
    DiscussionGroups,
    GroupMembers,
    PeopleFollowing,
    StarredPapers,
    Comments
)
from FlagEmbedding import FlagModel

# RDS connection string
DATABASE_URL = (
    "mysql+mysqlconnector://admin:c0eYBliLpdHULPaktvSE@"
    "researchpulse.cbkkuyoa4oz7.us-east-2.rds.amazonaws.com:3306/"
    "researchpulse"
)
# Create SQLAlchemy engine and session
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def insert_following():
    "function to insert following"
    return """
        INSERT IGNORE INTO people_following (person_id, follower_id) 
        VALUES (%s, %s)
    """

def insert_group_member():
    "function to insert group member"
    return """
        INSERT INTO group_members (group_id, person_id)
        VALUES (%s, %s)
    """

def get_random_papers(cursor):
    "function to get random papers"
    cursor.execute("SELECT title FROM papers ORDER BY RAND() LIMIT 5")
    return cursor.fetchall()

def get_person_by_id(cursor, person_id):
    "function to get person by id"
    cursor.execute("SELECT * FROM people WHERE person_id = %s", (person_id,))
    return cursor.fetchone()

def search_people_by_name(cursor, full_name):
    "function to search people by name"
    # Split full_name into words
    name_parts = full_name.strip().split()

    if len(name_parts) == 1:
        # If only one name part is queried, match either first or last name
        query = """
        SELECT person_id, first_name, last_name
        FROM people
        WHERE LOWER(first_name) LIKE LOWER(%s) OR LOWER(last_name) LIKE LOWER(%s)
        LIMIT 10;
        """
        like_pattern = f"%{name_parts[0]}%"
        cursor.execute(query, (like_pattern, like_pattern))

    elif len(name_parts) >= 2:
        # If two or more parts, try matching first and last name
        first_name, last_name = name_parts[0], ' '.join(name_parts[1:])
        query = """
        SELECT person_id, first_name, last_name
        FROM people
        WHERE LOWER(first_name) LIKE LOWER(%s) AND LOWER(last_name) LIKE LOWER(%s)
        LIMIT 10;
        """
        cursor.execute(query, (f"%{first_name}%", f"%{last_name}%"))

    return cursor.fetchall()

def build_paper_result(session, paper, followed_ids):
    "function to build paper result"
    author_links = session.query(Authors).filter_by(paper_id=paper.paper_id).all()
    author_names = []
    followed_authors = []

    for author_link in author_links[:3]:
        person = session.query(People).filter_by(person_id=author_link.author_id).first()
        if person:
            full_name = f"{person.first_name} {person.last_name}"
            is_followed = author_link.author_id in followed_ids
            author_names.append({
                "name": full_name,
                "isFollowed": is_followed,
            })
            if is_followed:
                followed_authors.append(full_name)

    if len(author_links) > 3:
        additional_authors = []
        for author_link in author_links[3:]:
            person = session.query(People).filter_by(person_id=author_link.author_id).first()
            if person:
                full_name = f"{person.first_name} {person.last_name}"
                if full_name not in followed_authors and author_link.author_id in followed_ids:
                    additional_authors.append({"name": full_name, "isFollowed": True})
        if additional_authors:
            author_names = author_names + additional_authors
        author_names.append({"name": "et al.", "isFollowed": False})

    journal_name = paper.journal.journal_name if paper.journal else 'N/A'

    return {
        "paperId": paper.paper_id,
        "title": paper.title,
        "year": str(paper.publication_date),
        "venue": journal_name,
        "authors": author_names,
    }

def get_followed_papers(session, person_id, limit=25):
    "Function to get followed papers."
    followed_ids = (
        session.query(PeopleFollowing.person_id)
        .filter(PeopleFollowing.follower_id == person_id)
        .all()
    )
    followed_ids = [f[0] for f in followed_ids]

    if not followed_ids:
        return []

    papers = (
        session.query(Papers)
        .join(Authors, Authors.paper_id == Papers.paper_id)
        .filter(Authors.author_id.in_(followed_ids))
        .order_by(Papers.publication_date.desc())
        .limit(limit)
        .all()
    )

    if not papers:
        return []

    paper_ids = [p.paper_id for p in papers]

    starred_ids = set(
        r[0]
        for r in session.query(StarredPapers.paper_id)
        .filter(StarredPapers.person_id == person_id)
        .filter(StarredPapers.paper_id.in_(paper_ids))
        .all()
    )

    result = []
    for paper in papers:
        paper_info = build_paper_result(session, paper, followed_ids)
        paper_info["starred"] = paper.paper_id in starred_ids
        result.append(paper_info)

    return result

def get_following(cursor, person_id):
    "function to get following"
    cursor.execute("""
        SELECT p.* FROM people p
        JOIN people_following pf ON p.person_id = pf.person_id
        WHERE pf.follower_id = %s
    """, (person_id,))
    return cursor.fetchall()

def get_starred_papers(cursor, person_id):
    "function to get starred papers"
    cursor.execute("""
        SELECT p.title, p.paper_id, pe.first_name, pe.last_name 
        FROM papers p
        JOIN starred_papers sp ON p.paper_id = sp.paper_id
        JOIN people pe ON sp.person_id = pe.person_id
        WHERE sp.person_id = %s
        ORDER BY p.publication_date DESC
    """, (person_id,))
    return cursor.fetchall()

def get_discussion_groups(cursor, person_id):
    "function to get discussion groups"
    cursor.execute("""
        SELECT gp.* FROM discussion_groups gp
        JOIN group_members gm ON gp.group_id = gm.group_id
        WHERE gm.person_id = %s
    """, (person_id,))
    return cursor.fetchall()

def get_group_by_id(cursor, group_id):
    "function to get group by id"
    cursor.execute("SELECT * FROM discussion_groups WHERE group_id = %s", (group_id,))
    return cursor.fetchone()

def get_person_data(person_id):
    """Retrieve person data, followers, following, authored papers, and group memberships."""
    session = Session()

    try:
        # Get basic person data
        person = session.query(People).filter_by(person_id=person_id).first()

        if not person:
            return None  # Person not found

        person_dict = {
            "person_id": person.person_id,
            "first_name": person.first_name,
            "last_name": person.last_name,
            "institution_id": person.institution_id,
            "primary_department": person.primary_department,
        }

        # Get people they are following
        following = (
            session.query(People)
            .join(PeopleFollowing, People.person_id == PeopleFollowing.person_id)
            .filter(PeopleFollowing.follower_id == person_id)
            .all()
        )
        person_dict["following"] = [
            {"person_id": p.person_id, "first_name": p.first_name, "last_name": p.last_name}
            for p in following
        ]


        # Get people who follow them
        followers = (
            session.query(People)
            .join(PeopleFollowing, People.person_id == PeopleFollowing.follower_id)
            .filter(PeopleFollowing.person_id == person_id)
            .all()
        )
        person_dict["followers"] = [
            {"person_id": p.person_id, "first_name": p.first_name, "last_name": p.last_name}
            for p in followers
        ]


        # Get authored papers
        authored_papers = (
            session.query(Papers)
            .join(Authors, Papers.paper_id == Authors.paper_id)
            .filter(Authors.author_id == person_id)
            .all()
        )
        person_dict["authored_papers"] = [
            {"paper_id": p.paper_id, "title": p.title, "publication_date": p.publication_date}
            for p in authored_papers
        ]

        # Get group memberships
        groups = (
            session.query(DiscussionGroups)
            .join(GroupMembers, DiscussionGroups.group_id == GroupMembers.group_id)
            .filter(GroupMembers.person_id == person_id)
            .all()
        )
        person_dict["groups"] = [
            {"group_id": g.group_id, "group_name": g.group_name, "description": g.description}
            for g in groups
        ]

        # Get starred papers
        starred_papers = (
            session.query(Papers)
            .join(StarredPapers, Papers.paper_id == StarredPapers.paper_id)
            .filter(StarredPapers.person_id == person_id)
            .all()
        )

        person_dict["starred_papers"] = [
            {"paper_id": p.paper_id, "title": p.title, "publication_date": p.publication_date}
            for p in starred_papers
        ]
        return person_dict

    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        return None

    finally:
        session.close()

def get_group_data(group_id):
    """Retrieve group name, description, and members."""
    session = Session()

    try:
        # Get basic group data
        group = session.query(DiscussionGroups).filter_by(group_id=group_id).first()

        if not group:
            return None  # Group not found

        group_dict = {
            "group_id": group.group_id,
            "group_name": group.group_name,
            "description": group.description,
        }

        # Get members of the group
        members = (
            session.query(People)
            .join(GroupMembers, People.person_id == GroupMembers.person_id)
            .filter(GroupMembers.group_id == group_id)
            .all()
        )

        group_dict["members"] = [
            {
                "person_id": m.person_id,
                "first_name": m.first_name,
                "last_name": m.last_name,
            }
            for m in members
        ]

        return group_dict

    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        return None

    finally:
        session.close()

def is_paper_starred(person_id, paper_id):
    """Check if a specific paper is already starred by the user."""
    session = Session()

    # Query the starred papers relationship
    result = session.query(StarredPapers).filter_by(person_id=person_id, paper_id=paper_id).first()

    return result is not None  # Returns True if the paper is starred, False otherwise

def star_paper(person_id, paper_id):
    """Add a paper to the user's starred list."""
    session = Session()

    # Check if the paper is already starred
    if is_paper_starred(person_id, paper_id):
        return "This paper is already starred", 400

    # Add the paper to the starred papers relationship
    starred_paper = StarredPapers(person_id=person_id, paper_id=paper_id)
    session.add(starred_paper)
    session.commit()

    return "Paper starred successfully", 200

def unstar_paper(person_id, paper_id):
    """Remove a paper from the user's starred list."""
    session = Session()

    # Check if the paper is starred
    if not is_paper_starred(person_id, paper_id):
        return "This paper is not starred", 400

    # Remove the paper from the starred papers relationship
    starred_paper = (
        session.query(StarredPapers)
        .filter_by(
            person_id=person_id,
            paper_id=paper_id,
        )
        .first()
    )
    if starred_paper:
        session.delete(starred_paper)
        session.commit()

    return "Paper unstarred successfully", 200

def print_paper_ids():
    """Print all paper IDs in the database."""
    session = Session()

    # Query all papers and get their IDs
    papers = session.query(Papers).all()

    # Print the IDs of all the papers
    for paper in papers:
        print(paper.paper_id)

def fetch_paper(session, paper_id):
    "function to fetch paper"
    return (
        session.query(Papers)
        .filter(Papers.paper_id == paper_id)
        .with_entities(
            Papers.paper_id,
            Papers.title,
            Papers.doi,
            Papers.publication_date,
        )
        .first()
    )

def fetch_authors(session, paper_id):
    "function to fetch authors"
    return (
        session.query(People)
        .join(Authors, People.person_id == Authors.author_id)
        .filter(Authors.paper_id == paper_id)
        .with_entities(
            People.person_id,
            People.first_name,
            People.last_name,
        )
        .all()
    )

def fetch_comments(session, paper_id):
    "function to fetch comments"
    return (
        session.query(Comments, People)
        .join(People, Comments.person_id == People.person_id)
        .filter(Comments.paper_id == paper_id)
        .with_entities(
            Comments.comment_text,
            Comments.date,
            People.first_name,
            People.last_name,
        )
        .order_by(Comments.date.desc())
        .all()
    )

def fetch_starred_by(session, paper_id):
    "function to fetch starred by"
    return (
        session.query(People)
        .join(StarredPapers, People.person_id == StarredPapers.person_id)
        .filter(StarredPapers.paper_id == paper_id)
        .with_entities(
            People.person_id,
            People.first_name,
            People.last_name,
        )
        .all()
    )

def get_paper_data(session, paper_id):
    """Fetch information about a specific paper."""

    paper = fetch_paper(session, paper_id)
    if not paper:
        return None

    authors = fetch_authors(session, paper_id)
    comments = fetch_comments(session, paper_id)
    starred_by = fetch_starred_by(session, paper_id)

    paper_data = {
        "paper": {
            "paper_id": paper.paper_id,
            "title": paper.title,
            "doi": paper.doi,
            "publication_date": paper.publication_date,
        },
        "authors": [
            {"person_id": a.person_id, "first_name": a.first_name, "last_name": a.last_name}
            for a in authors
        ],
        "comments": [
            {
                "comment_text": c.comment_text,
                "date": c.date,
                "first_name": c.first_name,
                "last_name": c.last_name,
            }
            for c in comments
        ],
        "starred_by": [
            {"person_id": s.person_id, "first_name": s.first_name, "last_name": s.last_name}
            for s in starred_by
        ],
    }

    return paper_data

def insert_comment(paper_id, person_id, comment_text, date=None):
    """Insert a comment for a paper."""
    session = Session()

    try:
        if not date:
            date = datetime.now()

        print(
            f"Inserting comment with paper_id: {paper_id}, "
            f"person_id: {person_id}, "
            f"comment_text: {comment_text}, "
            f"date: {date}"
        )
        comment = Comments(
            paper_id=paper_id,
            person_id=person_id,
            comment_text=comment_text,
            date=date
        )

        session.add(comment)
        session.commit()

        print(f"Comment inserted successfully! Comment ID: {comment.comment_id}")

    except SQLAlchemyError as e:
        session.rollback()
        print(f"Database error inserting comment: {e}")

    finally:
        session.close()

    return comment

model = FlagModel(
    'BAAI/bge-large-zh-v1.5',
    query_instruction_for_retrieval=(
        "Generate a representation for this sentence for retrieving related articles:"
    ),
    use_fp16=True,
)

def build_paper_summary(session, paper, starred_ids):
    "function to build paper summary"
    author_links = session.query(Authors).filter_by(paper_id=paper.paper_id).all()
    author_names = []

    for p in author_links[:3]:
        person = session.query(People).filter_by(person_id=p.author_id).first()
        if person:
            full_name = f"{person.first_name} {person.last_name}"
            author_names.append({"name": full_name})

    if len(author_links) > 3:
        author_names.append({"name": "et al."})

    journal_name = paper.journal.journal_name if paper.journal else 'N/A'

    return {
        "paperId": paper.paper_id,
        "title": paper.title,
        "year": str(paper.publication_date),
        "venue": journal_name,
        "authors": author_names,
        "starred": paper.paper_id in starred_ids,
    }

def sort_papers_by_similarity(starred_titles, papers):
    "function to sort by similarity"
    embeddings_1 = model.encode(starred_titles)
    paper_titles = [p.title for p in papers]
    embeddings_2 = model.encode(paper_titles)
    similarity = embeddings_1 @ embeddings_2.T
    sim_arr = np.array(similarity)
    papers_sorted = sorted(
        list(zip(np.sum(sim_arr, axis=0).tolist(), papers)),
        reverse=True,
        key=lambda x: x[0],
    )
    return [p[1] for p in papers_sorted]

def get_recent_papers(session, cursor, person_id, limit=20):
    "Function to get recent papers."
    papers = (
        session.query(Papers)
        .order_by(Papers.publication_date.desc())
        .limit(limit)
        .all()
    )
    if not papers:
        return []

    paper_ids = [p.paper_id for p in papers]

    starred_papers = get_starred_papers(cursor, person_id)
    starred_titles = [p[1] for p in starred_papers]

    if starred_titles:
        papers = sort_papers_by_similarity(starred_titles, papers)

    starred_ids = set(
        r[0] for r in session.query(StarredPapers.paper_id)
        .filter(StarredPapers.person_id == person_id)
        .filter(StarredPapers.paper_id.in_(paper_ids))
        .all()
    )

    result = [build_paper_summary(session, paper, starred_ids) for paper in papers]
    return result

def get_random_authors(session, limit=5):
    "function to get random authors"
    papers = session.query(Papers).order_by(func.rand()).limit(limit).all()

    author_ids = set()
    authors_list = []

    for paper in papers:
        authors = (
            session.query(People, Institutions.institution_name)
            .join(Authors, People.person_id == Authors.author_id)
            .outerjoin(Institutions, People.institution_id == Institutions.institution_id)
            .filter(Authors.paper_id == paper.paper_id)
            .all()
        )
        for author, institution_name in authors:
            if author.person_id not in author_ids:
                author_ids.add(author.person_id)
                authors_list.append({
                    "person_id": author.person_id,
                    "first_name": author.first_name,
                    "last_name": author.last_name,
                    "primary_department": author.primary_department or "No department",
                    "institution_id": institution_name or "No institution"
                })

    return authors_list
