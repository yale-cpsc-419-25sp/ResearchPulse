import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database_defs import Base, Papers, Journals, Authors, People, Institutions, DiscussionGroups, GroupMembers
from constants import test_input

# Fetch cancer research papers from Semantic Scholar
def get_cancer_research_papers(query="cancer research", limit=20, fields=None, debug=False):
    if debug:
        return test_input
    
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    
    if fields is None:
        fields = "title,venue,authors,year"
    
    params = {
        "query": query,
        "limit": limit,
        "fields": fields
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
        return []
        
    return response.json().get("data", [])

def get_discussion_group():

    groups = [
        {
            "group_id": "Group1",
            "group_name": "Cancer Research Group",
            "description": "A group for researchers working on cancer-related topics.",
        },
        {
            "group_id": "Group2",
            "group_name": "AI in Medicine",
            "description": "A group for researchers exploring AI applications in medicine.",
        },
        {
            "group_id": "Group3",
            "group_name": "Genomics and Bioinformatics",
            "description": "A community focused on large-scale genomics, sequencing technologies, and data pipelines.",
        },
        {
            "group_id": "Group4",
            "group_name": "Public Health Policy",
            "description": "Talk data-driven policies, global health challenges, and epidemiology.",
        },
    ]
    
    return groups


def populate_discussion_groups():
    # Use the RDS connection string here
    DATABASE_URL = "mysql+mysqlconnector://admin:c0eYBliLpdHULPaktvSE@researchpulse.cbkkuyoa4oz7.us-east-2.rds.amazonaws.com:3306/researchpulse"
    
    # Establish the engine and session
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)  # Create tables in RDS database
    Session = sessionmaker(bind=engine)
    session = Session()
    groups = get_discussion_group()

    # Handle groups

    for group in groups:
        existing_group = session.query(DiscussionGroups).filter_by(group_id=group["group_id"]).first()
        if not existing_group:
            new_group = DiscussionGroups(
                group_id=group["group_id"],
                group_name=group["group_name"],
                description=group["description"],
            )
            print(group["group_id"])
            print(group["group_name"])
            session.add(new_group)
        else:
        # Update group info if it has changed
            if existing_group.group_name != group["group_name"]:
                existing_group.group_name = group["group_name"]
            if existing_group.description != group["description"]:
                existing_group.description = group["description"]
    session.commit()


    session.close()

# Populate the database with retrieved papers
def populate_database():
    # Use the RDS connection string here
    DATABASE_URL = "mysql+mysqlconnector://admin:c0eYBliLpdHULPaktvSE@researchpulse.cbkkuyoa4oz7.us-east-2.rds.amazonaws.com:3306/researchpulse"

    # Establish the engine and session
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)  # Create tables in RDS database
    Session = sessionmaker(bind=engine)
    session = Session()

    papers = get_cancer_research_papers()

    for paper in papers:
        paper_id = paper.get("doi", paper.get("title").replace(" ", "_"))
        journal_name = paper.get("venue", "Unknown Journal")
        journal = session.query(Journals).filter_by(journal_name=journal_name).first()
        if not journal:
            journal = Journals(journal_id=journal_name.replace(" ", "_"), journal_name=journal_name, impact_factor="N/A")
            session.add(journal)
            session.commit()

        # Check if paper exists before adding
        with session.no_autoflush:
            existing_paper = session.query(Papers).filter_by(paper_id=paper_id).first()

        if not existing_paper:
            new_paper = Papers(
                paper_id=paper_id,
                doi=paper.get("doi"),
                title=paper.get("title"),
                publication_date=paper.get("year", "Unknown"),
                journal_id=journal.journal_id
            )
            session.add(new_paper)
            session.commit()
        else:
            new_paper = existing_paper

        authors = paper.get("authors", [])

        for i, author in enumerate(authors):
            author_id = author.get("authorId", f"unknown_{author.get('name')}")
            
            # Check if person (author) already exists
            with session.no_autoflush:
                person = session.query(People).filter_by(person_id=author_id).first()

            if not person:
                author_name = author.get("name", "Unknown").split()
                first_name = author_name[0] if len(author_name) > 0 else "Unknown"
                last_name = author_name[-1] if len(author_name) > 1 else "Unknown"
                
                # Handle institution only for first and last authors
                institution_name = (
                    author.get("affiliations", [{}])[0].get("name", "Unknown Institution")
                    if i == 0 or i == len(authors) - 1 else None
                )
                
                institution_id = None
                if institution_name:
                    with session.no_autoflush:
                        institution = session.query(Institutions).filter_by(institution_name=institution_name).first()
                    if not institution:
                        institution = Institutions(
                            institution_id=institution_name.replace(" ", "_"),
                            institution_name=institution_name
                        )
                        session.add(institution)
                        session.commit()
                    institution_id = institution.institution_id

                # Add new author if not found
                person = People(
                    person_id=author_id,
                    first_name=first_name,
                    last_name=last_name,
                    institution_id=institution_id
                )
                session.add(person)
                session.commit()

            # Check if the author-paper relationship already exists
            with session.no_autoflush:
                existing_author = (
                    session.query(Authors)
                    .filter_by(author_id=person.person_id, paper_id=new_paper.paper_id)
                    .first()
                )

            if not existing_author:
                try:
                    new_author = Authors(
                        author_id=person.person_id,
                        paper_id=new_paper.paper_id
                    )
                    session.add(new_author)
                    session.commit()
                except IntegrityError:
                    session.rollback()
                    print(f"Duplicate entry for author {person.person_id} and paper {new_paper.paper_id} ignored.")

    session.commit()
    session.close()
    print("Database populated successfully!")

if __name__ == "__main__":
    ## test the get_cancer_research_papers function

    papers = get_cancer_research_papers()
    print(papers)

    # populate_database()
    populate_discussion_groups()
