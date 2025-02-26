import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database_defs import Base, Papers, Journals, Authors, People, Institutions
from constants import test_input

# Fetch cancer research papers from Semantic Scholar
def get_cancer_research_papers(query="cancer research", limit=10, fields=None, debug=False):
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
        print(paper)
        journal_name = paper.get("venue", "Unknown Journal")
        
        # Check if journal already exists in the database, if not, create it
        journal = session.query(Journals).filter_by(journal_name=journal_name).first()
        if not journal:
            journal = Journals(journal_id=journal_name.replace(" ", "_"), journal_name=journal_name, impact_factor="N/A")
            session.add(journal)
            session.commit()

        # Add paper entry to the Papers table
        new_paper = Papers(
            paper_id=paper.get("doi", paper.get("title").replace(" ", "_")),
            doi=paper.get("doi"),
            title=paper.get("title"),
            publication_date=paper.get("year", "Unknown"),
            journal_id=journal.journal_id
        )
        session.add(new_paper)
        session.commit()

        authors = paper.get("authors", [])

        for i, author in enumerate(authors):
            print(author)
            author_id = author.get("authorId", f"unknown_{author.get('name')}")
            author_name = author.get("name", "Unknown").split()
            first_name = author_name[0] if len(author_name) > 0 else "Unknown"
            last_name = author_name[-1] if len(author_name) > 1 else "Unknown"

            # Extract institution for the first and last authors
            institution_name = author.get("affiliations", [{}])[0].get("name", "Unknown Institution") if i == 0 or i == len(authors) - 1 else None
            
            institution_id = None
            if institution_name:
                institution = session.query(Institutions).filter_by(institution_name=institution_name).first()
                if not institution:
                    institution = Institutions(
                        institution_id=institution_name.replace(" ", "_"),
                        institution_name=institution_name
                    )
                    session.add(institution)
                    session.commit()
                institution_id = institution.institution_id

            # Add person (author) entry to the People table
            person = session.query(People).filter_by(person_id=author_id).first()
            if not person:
                person = People(
                    person_id=author_id,
                    first_name=first_name,
                    last_name=last_name,
                    institution_id=institution_id
                )
                session.add(person)
                session.commit()

            # Link author to paper
            new_author = Authors(author_id=person.person_id, paper_id=new_paper.paper_id)
            session.add(new_author)

    session.commit()  # Commit any remaining changes
    session.close()  # Close the session

    print("Database populated successfully!")

if __name__ == "__main__":
    ## test the get_cancer_research_papers function
    papers = get_cancer_research_papers()
    print(papers)

    populate_database()
