"""
Unit tests for ResearchPulse backend application
"""
import unittest
from unittest.mock import patch, MagicMock, Mock
import json
import jwt
import datetime
from flask import Flask
import mysql.connector
from app import app, get_db_connection, token_required

class TestResearchPulseBackend(unittest.TestCase):
    """Test class for ResearchPulse backend application"""
    
    def setUp(self):
        """Set up test client and other test variables"""
        self.app = app.test_client()
        self.app.testing = True
        
        # Mock database connection
        self.db_conn_patcher = patch('app.get_db_connection')
        self.mock_db_conn = self.db_conn_patcher.start()
        self.mock_connection = MagicMock()
        self.mock_cursor = MagicMock()
        self.mock_connection.cursor.return_value = self.mock_cursor
        self.mock_db_conn.return_value = self.mock_connection
        
        # Test user data
        self.test_user = {
            'username': 'testuser',
            'password': 'testpassword',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        # Test paper data
        self.test_paper = {
            'paper_id': '123',
            'title': 'Test Paper Title',
            'doi': 'test-doi-123',
            'publication_date': '2025-01-01'
        }
        
        # Test comment data
        self.test_comment = {
            'person_id': '1',
            'paper_id': '123',
            'comment_text': 'This is a test comment',
            'date': '2025-04-29'
        }
        
        # Create test token
        self.test_token = jwt.encode({
            'person_id': '1',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    def tearDown(self):
        """Tear down all initialized variables"""
        self.db_conn_patcher.stop()

    # Authentication Tests
    def test_signup_success(self):
        """Test successful user signup"""
        # Configure mock
        self.mock_cursor.lastrowid = 1
        self.mock_cursor.fetchone.return_value = {
            'person_id': 1, 
            'username': self.test_user['username']
        }
        
        # Make request
        response = self.app.post(
            '/signup',
            data=json.dumps(self.test_user),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(data['success'])
        self.assertEqual(data['person_id'], 1)
        self.assertEqual(data['username'], self.test_user['username'])

    def test_signup_missing_fields(self):
        """Test signup with missing fields"""
        # Incomplete user data
        incomplete_user = {
            'username': 'testuser',
            'password': 'testpassword'
        }
        
        # Make request
        response = self.app.post(
            '/signup',
            data=json.dumps(incomplete_user),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(data['error'], "Missing required fields")

    def test_login_success(self):
        """Test successful login"""
        # Configure mock
        self.mock_cursor.fetchone.side_effect = [
            # First for user login check
            {
                'person_id': 1, 
                'username': self.test_user['username'],
                'password_hash': '$2b$12$zxEr9BI6YdSdLDl2UmUfx.aqHR7UYkOXP6sXiwU0fGYL5zXzQhuLG'  # Hashed 'testpassword'
            },
            # Second for person data
            {
                'person_id': 1,
                'first_name': 'Test',
                'last_name': 'User'
            }
        ]
        
        # Mock bcrypt password check
        with patch('app.bcrypt.check_password_hash', return_value=True):
            # Make request
            response = self.app.post(
                '/login',
                data=json.dumps({
                    'username': self.test_user['username'],
                    'password': self.test_user['password']
                }),
                content_type='application/json'
            )
            
            # Check response
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertTrue(data['success'])
            self.assertIn('token', data)
            self.assertEqual(data['person_id'], 1)

    def test_login_invalid_username(self):
        """Test login with invalid username"""
        # Configure mock
        self.mock_cursor.fetchone.return_value = None
        
        # Make request
        response = self.app.post(
            '/login',
            data=json.dumps({
                'username': 'invaliduser',
                'password': self.test_user['password']
            }),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 401)
        self.assertFalse(data['success'])
        self.assertEqual(data['error'], "Invalid username")

    def test_login_invalid_password(self):
        """Test login with invalid password"""
        # Configure mock
        self.mock_cursor.fetchone.side_effect = [
            # First for user login check
            {
                'person_id': 1, 
                'username': self.test_user['username'],
                'password_hash': '$2b$12$zxEr9BI6YdSdLDl2UmUfx.aqHR7UYkOXP6sXiwU0fGYL5zXzQhuLG'  # Hashed 'testpassword'
            }
        ]
        
        # Mock bcrypt password check
        with patch('app.bcrypt.check_password_hash', return_value=False):
            # Make request
            response = self.app.post(
                '/login',
                data=json.dumps({
                    'username': self.test_user['username'],
                    'password': 'wrongpassword'
                }),
                content_type='application/json'
            )
            
            # Check response
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 401)
            self.assertFalse(data['success'])
            self.assertEqual(data['error'], "Invalid password")

    # Paper Management Tests
    @patch('app.is_paper_starred')
    @patch('app.get_recent_papers')
    def test_get_recent_papers(self, mock_get_recent_papers, mock_is_paper_starred):
        """Test getting recent papers"""
        # Configure mocks
        mock_papers = [
            {
                "paperId": "123",
                "title": "Test Paper 1",
                "year": "2025",
                "venue": "Test Venue",
                "authors": [{"name": "Test Author"}]
            },
            {
                "paperId": "456",
                "title": "Test Paper 2",
                "year": "2024",
                "venue": "Test Venue 2",
                "authors": [{"name": "Another Author"}]
            }
        ]
        mock_get_recent_papers.return_value = mock_papers
        mock_is_paper_starred.return_value = False
        
        # Create auth headers
        headers = {
            'Authorization': f'Bearer {self.test_token}'
        }
        
        # Make request
        with patch('app.jwt.decode', return_value={'person_id': '1'}):
            response = self.app.get('/api/recent_papers', headers=headers)
            
            # Check response
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertTrue(data['success'])
            self.assertEqual(len(data['papers']), 2)
            self.assertEqual(data['papers'][0]['title'], "Test Paper 1")
            self.assertEqual(data['papers'][1]['title'], "Test Paper 2")

    @patch('app.get_paper_data')
    def test_get_paper(self, mock_get_paper_data):
        """Test getting paper details"""
        # Configure mock
        mock_get_paper_data.return_value = {
            "paper": self.test_paper,
            "authors": [
                {"person_id": "1", "first_name": "Test", "last_name": "Author"}
            ],
            "comments": [
                {"comment_text": "Test comment", "date": "2025-04-29", "first_name": "Test", "last_name": "User"}
            ],
            "starred_by": [
                {"person_id": "1", "first_name": "Test", "last_name": "User"}
            ]
        }
        
        # Make request
        response = self.app.get(f'/paper/{self.test_paper["paper_id"]}')
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['paper']['title'], self.test_paper['title'])
        self.assertEqual(len(data['authors']), 1)
        self.assertEqual(len(data['comments']), 1)
        self.assertEqual(len(data['starred_by']), 1)

    @patch('app.insert_comment')
    @patch('app.get_person_data')
    def test_add_comment(self, mock_get_person_data, mock_insert_comment):
        """Test adding a comment to a paper"""
        # Configure mocks
        mock_comment = MagicMock()
        mock_comment.comment_id = 1
        mock_comment.person_id = self.test_comment['person_id']
        mock_comment.comment_text = self.test_comment['comment_text']
        mock_insert_comment.return_value = mock_comment
        
        mock_get_person_data.return_value = {
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        # Make request
        response = self.app.post(
            f'/paper/{self.test_comment["paper_id"]}/comment',
            data=json.dumps(self.test_comment),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['comment_id'], 1)
        self.assertEqual(data['comment_text'], self.test_comment['comment_text'])
        self.assertEqual(data['first_name'], 'Test')
        self.assertEqual(data['last_name'], 'User')

    # Following Tests
    def test_follow_user(self):
        """Test following a user"""
        # Configure mock
        self.mock_cursor.fetchone.return_value = None  # No existing follow relationship
        
        # Make request
        response = self.app.post(
            '/follow',
            data=json.dumps({
                'person_id': '1',  # Current user
                'user_id': '2'     # User to follow
            }),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("now following", data['message'])
        
        # Verify DB call
        self.mock_cursor.execute.assert_called_with(
            "INSERT INTO people_following (person_id, follower_id) VALUES (%s, %s)",
            ('2', '1')
        )

    def test_follow_self(self):
        """Test following yourself (should fail)"""
        # Make request
        response = self.app.post(
            '/follow',
            data=json.dumps({
                'person_id': '1',  # Current user
                'user_id': '1'     # Same user ID
            }),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['error'], "You cannot follow yourself")

    def test_follow_already_following(self):
        """Test following a user already being followed"""
        # Configure mock
        self.mock_cursor.fetchone.return_value = True  # Existing follow relationship
        
        # Make request
        response = self.app.post(
            '/follow',
            data=json.dumps({
                'person_id': '1',  # Current user
                'user_id': '2'     # User to follow
            }),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['error'], "You are already following this user")

    def test_unfollow_user(self):
        """Test unfollowing a user"""
        # Make request
        response = self.app.post(
            '/unfollow',
            data=json.dumps({
                'person_id': '1',
                'user_id': '2'     
            }),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("unfollowed", data['message'])
        
        # Verify DB call
        self.mock_cursor.execute.assert_called_with(
            "DELETE FROM people_following WHERE person_id = %s AND follower_id = %s",
            ('2', '1')
        )

    @patch('app.Session')
    # Trying to implement testing for star paper, but not exactly working
    def test_star_paper(self, mock_session):
        """Test starring a paper"""
        # Configure mock
        mock_session_instance = MagicMock()
        mock_session.return_value = mock_session_instance
        mock_query = MagicMock()
        mock_session_instance.query.return_value = mock_query
        mock_filter_by = MagicMock()
        mock_query.filter_by.return_value = mock_filter_by
        mock_filter_by.first.return_value = None  
        
        # Make request
        response = self.app.post(
            '/star_paper',
            data=json.dumps({
                'person_id': '1',
                'paper_id': '123'
            }),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['paper']['paperId'], '123')

    @patch('app.Session')
    def test_unstar_paper(self, mock_session):
        """Test unstarring a paper"""
        # Configure mocks
        mock_session_instance = MagicMock()
        mock_session.return_value = mock_session_instance
        mock_query = MagicMock()
        mock_session_instance.query.return_value = mock_query
        mock_filter_by = MagicMock()
        mock_query.filter_by.return_value = mock_filter_by
        
        # First for check if starred
        mock_starred_paper = MagicMock()
        mock_filter_by.first.return_value = mock_starred_paper
        
        # Make request
        response = self.app.post(
            '/unstar_paper',
            data=json.dumps({
                'person_id': '1',
                'paper_id': '123'
            }),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertFalse(data['starred'])

    # Group Tests
    @patch('app.get_group_data')
    def test_get_group(self, mock_get_group_data):
        """Test retrieving a group"""
        # Configure mock
        mock_get_group_data.return_value = {
            'group_id': '1',
            'group_name': 'Test Group',
            'description': 'A test group',
            'members': [
                {'person_id': '1', 'first_name': 'Test', 'last_name': 'User'}
            ]
        }
        
        # Make request
        response = self.app.get('/group/1')
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['group_name'], 'Test Group')
        self.assertEqual(len(data['members']), 1)

    @patch('app.Session')
    def test_join_group(self, mock_session):
        """Test joining a group"""
        # Configure mock
        mock_session_instance = MagicMock()
        mock_session.return_value = mock_session_instance
        mock_query = MagicMock()
        mock_session_instance.query.return_value = mock_query
        mock_get = MagicMock()
        mock_query.get.return_value = {'group_id': '1', 'group_name': 'Test Group'}
        
        # Make request
        response = self.app.post(
            '/join_group',
            data=json.dumps({
                'person_id': '1',
                'group_id': '1'
            }),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn("joined group", data['message'])

    @patch('app.Session')
    def test_leave_group(self, mock_session):
        """Test leaving a group"""
        # Configure mock
        mock_session_instance = MagicMock()
        mock_session.return_value = mock_session_instance
        mock_query = MagicMock()
        mock_session_instance.query.return_value = mock_query
        mock_get = MagicMock()
        mock_query.get.return_value = {'group_id': '1', 'group_name': 'Test Group'}
        
        # Make request
        response = self.app.post(
            '/leave_group',
            data=json.dumps({
                'person_id': '1',
                'group_id': '1'
            }),
            content_type='application/json'
        )
        
        # Check response
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn("left group", data['message'])

if __name__ == '__main__':
    unittest.main()