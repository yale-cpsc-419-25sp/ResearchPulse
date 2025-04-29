"""
Unit tests for database queries module
"""
import unittest
from unittest.mock import patch, MagicMock, Mock
import datetime
from queries import (
    get_person_data,
    get_group_data,
    search_people_by_name,
    get_followed_papers,
    get_following,
    get_person_by_id,
    get_starred_papers,
    get_paper_data,
    insert_comment,
    get_recent_papers,
    is_paper_starred,
    get_random_authors,
)

class TestQueries(unittest.TestCase):
    """Test class for database query functions"""
    
    def setUp(self):
        """Set up test variables"""
        # Mock SQLAlchemy session
        self.mock_session = MagicMock()
        self.mock_cursor = MagicMock()
        
        # Sample test data
        self.test_person_id = 1
        self.test_group_id = 1
        self.test_paper_id = 1

    def test_get_person_data(self):
        """Test retrieving person data"""
        # Configure session mocks
        person_mock = MagicMock()
        person_mock.person_id = self.test_person_id
        person_mock.first_name = "Yoshua"
        person_mock.last_name = "Bengio"
        person_mock.institution_id = 3
        person_mock.primary_department = "Department of Computer Science"

        
        following_mock = [
            MagicMock(person_id=2, first_name="Jane", last_name="Doe"),
            MagicMock(person_id=3, first_name="John", last_name="Smith")
        ]
        
        followers_mock = [
            MagicMock(person_id=4, first_name="Alice", last_name="Johnson")
        ]
        
        authored_papers_mock = [
            MagicMock(
                paper_id=42,
                title="Neural Probabilistic Language Models",
                publication_date=datetime.date(2003, 6, 1)
            )
        ]
        
        groups_mock = [
            MagicMock(group_id=1, group_name="Test Group", description="A test group")
        ]
        
        starred_papers_mock = [
            MagicMock(
                paper_id=3,
                title="Starred Paper",
                publication_date=datetime.date(2025, 3, 15)
            )
        ]
        
        # Set up query return values
        query_mock = MagicMock()
        self.mock_session.query.return_value = query_mock
        
        filter_by_mock = MagicMock()
        query_mock.filter_by.return_value = filter_by_mock
        filter_by_mock.first.return_value = person_mock
        
        # Configure complex joins for different queries
        join_mock = MagicMock()
        filter_mock = MagicMock()
        query_mock.join.return_value = join_mock
        join_mock.filter.return_value = filter_mock
        all_mock = MagicMock()
        filter_mock.all.return_value = all_mock
        
        # Set up side effects for different queries
        query_side_effects = [
            query_mock,
            query_mock,  
            query_mock,  
            query_mock, 
            query_mock,  
            query_mock   
        ]
        self.mock_session.query.side_effect = query_side_effects
        
        # Configure join side effects
        join_side_effects = [
            join_mock, 
            join_mock,  
            join_mock,  
            join_mock, 
            join_mock   
        ]
        query_mock.join.side_effect = join_side_effects
        
        # Configure all() side effects
        all_side_effects = [
            following_mock,     
            followers_mock,     
            authored_papers_mock,
            groups_mock,       
            starred_papers_mock  
        ]
        filter_mock.all.side_effect = all_side_effects
        
        # Mock the Session creation
        with patch('queries.Session', return_value=self.mock_session):
            # Call the function
            result = get_person_data(self.test_person_id)
            
            # Verify result
            self.assertIsNotNone(result)
            self.assertEqual(result['person_id'], self.test_person_id)
            self.assertEqual(result['first_name'], "Yoshua")
            self.assertEqual(result['last_name'], "Bengio")
            
            # Check if lists are present in the result
            self.assertIn('following', result)
            self.assertEqual(len(result['following']), 2)
            
            self.assertIn('followers', result)
            self.assertEqual(len(result['followers']), 1)
            
            self.assertIn('authored_papers', result)
            self.assertEqual(len(result['authored_papers']), 1)
            
            self.assertIn('groups', result)
            self.assertEqual(len(result['groups']), 1)
            
            self.assertIn('starred_papers', result)
            self.assertEqual(len(result['starred_papers']), 1)

    def test_search_people_by_name_single_name(self):
        """Test searching people by a single name part with casing and variation"""
        self.mock_cursor.fetchall.return_value = [
            {'person_id': 101, 'first_name': 'Wei', 'last_name': 'Li'},
            {'person_id': 102, 'first_name': 'Weihua', 'last_name': 'Zhou'},
        ]

        result = search_people_by_name(self.mock_cursor, "Wei")

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['first_name'], 'Wei')
        self.assertEqual(result[1]['first_name'], 'Weihua')

        self.mock_cursor.execute.assert_called_once()
        args = self.mock_cursor.execute.call_args[0]
        self.assertIn("LIKE", args[0])
        self.assertEqual(args[1][0], "%Wei%")


    def test_search_people_by_name_full_name(self):
        """Test searching people by full name"""
        # Configure mock
        self.mock_cursor.fetchall.return_value = [
            {'person_id': 1, 'first_name': 'John', 'last_name': 'Smith'}
        ]
        
        # Call function
        result = search_people_by_name(self.mock_cursor, "John Smith")
        
        # Verify result
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['first_name'], 'John')
        self.assertEqual(result[0]['last_name'], 'Smith')
        
        # Check that execute was called with the right patterns
        self.mock_cursor.execute.assert_called_once()
        args = self.mock_cursor.execute.call_args[0]
        self.assertIn("AND", args[0])  # SQL contains AND for combining first and last name
        self.assertEqual(args[1][0], "%John%")   
        self.assertEqual(args[1][1], "%Smith%")  

    def test_get_paper_data(self):
        """Test retrieving paper data"""
        # Configure mocks for paper and related data
        paper_mock = MagicMock(
            paper_id=self.test_paper_id,
            title="Deep Residual Learning for Image Recognition",
            doi="10.1109/CVPR.2016.90",
            publication_date=datetime.date(2016, 6, 27)
        )

        authors_mock = [
            MagicMock(person_id=1, first_name="Kaiming", last_name="He"),
            MagicMock(person_id=2, first_name="Xiangyu", last_name="Zhang"),
            MagicMock(person_id=3, first_name="Shaoqing", last_name="Ren"),
            MagicMock(person_id=4, first_name="Jian", last_name="Sun")
        ]

        
        comments_mock = [
            MagicMock(
                comment_text="Awesomeeee",
                date=datetime.datetime(2025, 4, 1, 12, 0),
                first_name="Alice",
                last_name="Johnson"
            )
        ]
        
        starred_by_mock = [
            MagicMock(person_id=3, first_name="Bob", last_name="Brown")
        ]
        
        # Mock the fetch functions
        with patch('queries.fetch_paper', return_value=paper_mock) as mock_fetch_paper:
            with patch('queries.fetch_authors', return_value=authors_mock) as mock_fetch_authors:
                with patch('queries.fetch_comments', return_value=comments_mock) as mock_fetch_comments:
                    with patch('queries.fetch_starred_by', return_value=starred_by_mock) as mock_fetch_starred_by:
                        # Call the function
                        result = get_paper_data(self.mock_session, self.test_paper_id)
                        
                        # Verify the function calls
                        mock_fetch_paper.assert_called_once_with(self.mock_session, self.test_paper_id)
                        mock_fetch_authors.assert_called_once_with(self.mock_session, self.test_paper_id)
                        mock_fetch_comments.assert_called_once_with(self.mock_session, self.test_paper_id)
                        mock_fetch_starred_by.assert_called_once_with(self.mock_session, self.test_paper_id)
                        
                        # Verify result structure
                        self.assertIsNotNone(result)
                        self.assertIn('paper', result)
                        self.assertIn('authors', result)
                        self.assertIn('comments', result)
                        self.assertIn('starred_by', result)
                        
                        # Check paper details
                        self.assertEqual(result['paper']['paper_id'], self.test_paper_id)
                        self.assertEqual(result['paper']['title'], "Deep Residual Learning for Image Recognition")
                        
                        # Check related data counts
                        self.assertEqual(len(result['authors']), 4)
                        self.assertEqual(len(result['comments']), 1)
                        self.assertEqual(len(result['starred_by']), 1)

    def test_get_group_data(self):
        """Test retrieving group data"""
        mock_group = MagicMock(group_id="Group1", group_name="Cancer Research Group")
        self.mock_session.query.return_value.filter_by.return_value.first.return_value = mock_group

        with patch('queries.Session', return_value=self.mock_session):
            result = get_group_data("Group1")
            
            self.assertIsNotNone(result)
            self.assertEqual(result['group_id'], "Group1")
            self.assertEqual(result['group_name'], "Cancer Research Group")

    # Having some difficulty with this unit test
    def test_get_followed_papers(self):
        """Test getting followed papers"""
        mock_paper = MagicMock()
        mock_paper.paper_id = 10
        mock_paper.title = "Cancer Study Breakthrough"
        mock_paper.publication_date = datetime.date(2023, 5, 20)

        mock_author = MagicMock()
        mock_author.first_name = "Jane"
        mock_author.last_name = "Doe"

        # Properly chain mocks
        self.mock_session.query.return_value.join.return_value.join.return_value.join.return_value.filter.return_value.all.return_value = [(mock_paper, mock_author)]

        result = get_followed_papers(self.mock_session, self.test_person_id)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['title'], "Cancer Study Breakthrough")
        self.assertEqual(result[0]['authors'][0]['name'], "Jane Doe")


    def test_get_following(self):
        """Test getting people following"""
        self.mock_cursor.fetchall.return_value = [
            {'person_id': 1, 'first_name': 'Jane', 'last_name': 'Doe'}
        ]

        result = get_following(self.mock_cursor, self.test_person_id)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['first_name'], 'Jane')

    def test_insert_comment(self):
        """Test inserting a comment"""
        # Simple mock: just ensure session commit called
        session = MagicMock()
        new_comment = insert_comment(1, 2, "Cool paper", datetime.datetime.now())

        self.assertIsNotNone(new_comment)
        self.assertEqual(new_comment.comment_text, "Cool paper")



