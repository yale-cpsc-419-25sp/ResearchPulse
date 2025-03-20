#!/usr/bin/env python

#-----------------------------------------------------------------------
# database_defs.py
# Author: 
#-----------------------------------------------------------------------
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()
DATABASE_URL = "mysql+mysqlconnector://admin:c0eYBliLpdHULPaktvSE@researchpulse.cbkkuyoa4oz7.us-east-2.rds.amazonaws.com:3306/researchpulse"

class Papers (Base):
    __tablename__ = 'papers'
    paper_id = Column(String(255), primary_key=True)  # Specify length for String
    doi = Column(String(255))
    title = Column(String(255))
    publication_date = Column(Date)  # Use Date instead of String
    journal_id = Column(String(255), ForeignKey('journals.journal_id'))

    journal = relationship("Journals", back_populates="papers")

class Journals (Base):
    __tablename__ = 'journals'
    journal_id = Column(String(255), primary_key=True)  # Specify length for String
    journal_name = Column(String(255))
    impact_factor = Column(String(255))
    
    papers = relationship("Papers", back_populates="journal")
    
class People (Base):
    __tablename__ = 'people'
    person_id = Column(String(255), primary_key=True)  # Specify length for String
    first_name = Column(String(255))
    last_name = Column(String(255))
    institution_id = Column(String(255), ForeignKey('institutions.institution_id'))
    primary_department = Column(String(255))

    institution = relationship("Institutions", back_populates="people")

class Authors (Base):
    __tablename__ = 'authors'
    author_id = Column(String(255), ForeignKey('people.person_id'), primary_key=True)  # Specify length for String
    paper_id = Column(String(255), ForeignKey('papers.paper_id'), primary_key=True)

class Institutions (Base):
    __tablename__ = 'institutions'
    institution_id = Column(String(255), primary_key=True)  # Specify length for String
    institution_name = Column(String(255))

    people = relationship("People", back_populates="institution")

class DiscussionGroups (Base):
    __tablename__ = 'discussion_groups'
    group_id = Column(String(255), primary_key=True)  # Specify length for String
    group_name = Column(String(255))
    description = Column(String(255))

class GroupMembers (Base):
    __tablename__ = 'group_members'
    group_id = Column(String(255), ForeignKey('discussion_groups.group_id'), primary_key=True)
    person_id = Column(String(255), ForeignKey('people.person_id'), primary_key=True)

class PeopleFollowing (Base):
    __tablename__ = 'people_following'
    person_id = Column(String(255), ForeignKey('people.person_id'), primary_key=True)
    follower_id = Column(String(255), ForeignKey('people.person_id'), primary_key=True)

class Comments (Base):
    __tablename__ = 'comments'
    comment_id = Column(String(255), primary_key=True)  # Specify length for String
    paper_id = Column(String(255), ForeignKey('papers.paper_id'))
    person_id = Column(String(255), ForeignKey('people.person_id'))
    comment_text = Column(String(255))
    parent_comment_id = Column(String(255), ForeignKey('comments.comment_id'))
    date = Column(Date)  # Use Date instead of String

class AI_Summaries (Base):
    __tablename__ = 'ai_summaries'
    paper_id = Column(String(255), ForeignKey('papers.paper_id'), primary_key=True)
    summary_text = Column(String(255))

# Establish connection to the RDS MySQL instance
engine = create_engine(DATABASE_URL)

# Create all tables defined in the Base class (i.e., in the database)
Base.metadata.create_all(engine)

print("Tables created successfully in the database!")