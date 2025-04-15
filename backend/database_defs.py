#!/usr/bin/env python

#-----------------------------------------------------------------------
# database_defs.py
# Author: 
#-----------------------------------------------------------------------
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()
DATABASE_URL = "mysql+mysqlconnector://admin:c0eYBliLpdHULPaktvSE@researchpulse.cbkkuyoa4oz7.us-east-2.rds.amazonaws.com:3306/researchpulse"

class Institutions(Base):
    __tablename__ = 'institutions'
    
    institution_id = Column(Integer, primary_key=True, autoincrement=True)
    institution_name = Column(String(255), unique=True)
    
    people = relationship("People", back_populates="institution")

class People(Base):
    __tablename__ = 'people'
    
    person_id = Column(Integer, primary_key=True, autoincrement=True)
    orcid_id = Column(String(255), unique=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    institution_id = Column(Integer, ForeignKey('institutions.institution_id'))
    primary_department = Column(String(255))

    institution = relationship("Institutions", back_populates="people")
    starred_papers = relationship("StarredPapers", back_populates="person")
    user_login = relationship("UserLogin", back_populates="person", uselist=False) # each user has 1 login

class UserLogin(Base):
    __tablename__ = 'user_login'
    
    person_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)
    username = Column(String(255), unique=True, nullable=False)  # Or email
    password_hash = Column(String(255), nullable=False)  # The hashed password (bcrypt hash)
    failed_attempts = Column(Integer, default=0)  # Optional: track failed login attempts
    account_locked = Column(Boolean, default=False)  # Optional: flag to lock the account after too many failed attempts
    
    person = relationship("People", back_populates="user_login", uselist=False)

class Journals(Base):
    __tablename__ = 'journals'
    
    journal_id = Column(Integer, primary_key=True, autoincrement=True)
    journal_name = Column(String(255))
    
    papers = relationship("Papers", back_populates="journal")

class Papers(Base):
    __tablename__ = 'papers'
    paper_id = Column(Integer, primary_key=True, autoincrement=True)
    doi = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    publication_date = Column(Date, nullable=True)
    journal_id = Column(Integer, ForeignKey('journals.journal_id'), nullable=True)

    journal = relationship("Journals", back_populates="papers")
    starred_by = relationship("StarredPapers", back_populates="paper")

class AI_Summaries(Base):
    __tablename__ = 'ai_summaries'
    
    paper_id = Column(Integer, ForeignKey('papers.paper_id'), primary_key=True)
    summary_text = Column(Text)

class Authors(Base):
    __tablename__ = 'authors'
    
    author_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)
    paper_id = Column(Integer, ForeignKey('papers.paper_id'), primary_key=True)

    paper = relationship("Papers", backref="authors")
    person = relationship("People", backref="authors")

class DiscussionGroups(Base):
    __tablename__ = 'discussion_groups'
    
    group_id = Column(String(255), primary_key=True)
    group_name = Column(String(255))
    description = Column(String(255))

class GroupMembers(Base):
    __tablename__ = 'group_members'
    
    group_id = Column(String(255), ForeignKey('discussion_groups.group_id'), primary_key=True)
    person_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)

class PeopleFollowing(Base):
    __tablename__ = 'people_following'
    
    person_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)
    follower_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)

class Comments(Base):
    __tablename__ = 'comments'
    
    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    paper_id = Column(Integer, nullable=False)
    person_id = Column(Integer, nullable=False)
    comment_text = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    
class StarredPapers(Base):
    __tablename__ = 'starred_papers'
    
    person_id = Column(Integer, ForeignKey('people.person_id'), primary_key=True)
    paper_id = Column(Integer, ForeignKey('papers.paper_id'), primary_key=True)
    starred_date = Column(Date)

    person = relationship("People", back_populates="starred_papers")
    paper = relationship("Papers", back_populates="starred_by")
        
# Establish connection to the RDS MySQL instance
engine = create_engine(DATABASE_URL)

# Drop all tables if they exist
Base.metadata.drop_all(engine)

# Create all tables defined in the Base class (i.e., in the database)
Base.metadata.create_all(engine)

print("Tables created successfully in the database!")