"""Program for database defs"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship

Base = declarative_base()
DATABASE_URL = (
    "mysql+mysqlconnector://admin:c0eYBliLpdHULPaktvSE@"
    "researchpulse.cbkkuyoa4oz7.us-east-2.rds.amazonaws.com:3306/"
    "researchpulse"
)
class Institutions(Base): # pylint: disable=too-few-public-methods
    "Class for institutions"
    __tablename__ = 'institutions'

    institution_id = Column(Integer, primary_key=True, autoincrement=True)
    institution_name = Column(String(255), unique=True)

    people = relationship("People", back_populates="institution")

class People(Base): # pylint: disable=too-few-public-methods
    "Class for people"
    __tablename__ = 'people'

    person_id = Column(Integer, primary_key=True, autoincrement=True)
    orcid_id = Column(String(255), unique=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    institution_id = Column(Integer, ForeignKey('institutions.institution_id'))
    primary_department = Column(String(255))

    institution = relationship("Institutions", back_populates="people")
    starred_papers = relationship("StarredPapers", back_populates="person")
    user_login = relationship("UserLogin", back_populates="person", uselist=False)

class UserLogin(Base): # pylint: disable=too-few-public-methods
    "Class for user logins"
    __tablename__ = 'user_login'

    person_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    failed_attempts = Column(Integer, default=0)
    account_locked = Column(Boolean, default=False)

    person = relationship("People", back_populates="user_login", uselist=False)

class Journals(Base): # pylint: disable=too-few-public-methods
    "Class for journals"
    __tablename__ = 'journals'

    journal_id = Column(Integer, primary_key=True, autoincrement=True)
    journal_name = Column(String(255))

    papers = relationship("Papers", back_populates="journal")

class Papers(Base): # pylint: disable=too-few-public-methods
    "Class for papers"
    __tablename__ = 'papers'
    paper_id = Column(Integer, primary_key=True, autoincrement=True)
    doi = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    publication_date = Column(Date, nullable=True)
    journal_id = Column(Integer, ForeignKey('journals.journal_id'), nullable=True)

    journal = relationship("Journals", back_populates="papers")
    starred_by = relationship("StarredPapers", back_populates="paper")

class AiSummaries(Base): # pylint: disable=too-few-public-methods
    "Class for ai summaries"
    __tablename__ = 'ai_summaries'

    paper_id = Column(Integer, ForeignKey('papers.paper_id'), primary_key=True)
    summary_text = Column(Text)

class Authors(Base): # pylint: disable=too-few-public-methods
    "Class for authors"
    __tablename__ = 'authors'

    author_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)
    paper_id = Column(Integer, ForeignKey('papers.paper_id'), primary_key=True)

    paper = relationship("Papers", backref="authors")
    person = relationship("People", backref="authors")

class DiscussionGroups(Base): # pylint: disable=too-few-public-methods
    "Class for discussion groups"
    __tablename__ = 'discussion_groups'

    group_id = Column(String(255), primary_key=True)
    group_name = Column(String(255))
    description = Column(String(255))

class GroupMembers(Base): # pylint: disable=too-few-public-methods
    "Class for group members"
    __tablename__ = 'group_members'

    group_id = Column(String(255), ForeignKey('discussion_groups.group_id'), primary_key=True)
    person_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)

class PeopleFollowing(Base): # pylint: disable=too-few-public-methods
    "Class for people following"
    __tablename__ = 'people_following'

    person_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)
    follower_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)

class Comments(Base): # pylint: disable=too-few-public-methods
    "Class for comments"
    __tablename__ = 'comments'

    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(Integer, nullable=False)
    person_id = Column(Integer, nullable=False)
    comment_text = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)

class StarredPapers(Base): # pylint: disable=too-few-public-methods
    "Class for starred papers"
    __tablename__ = 'starred_papers'

    person_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)
    paper_id = Column(Integer, ForeignKey('papers.paper_id'), primary_key=True)
    starred_date = Column(Date)

    person = relationship("People", back_populates="starred_papers")
    paper = relationship("Papers", back_populates="starred_by")

engine = create_engine(DATABASE_URL)
