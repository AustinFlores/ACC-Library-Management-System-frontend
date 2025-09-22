import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import '../styles/BrowseBooks.css';

function BrowseBooks({ userRole }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBooks = async (category) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/books?category=${encodeURIComponent(category)}`);
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchBooks(category);
  };

  const handleSearch = async (type, term) => {
    const endpoint = type === 'title' ? 'search-title' : 'search-author';
    try {
      const res = await axios.get(`http://localhost:5000/api/books/${endpoint}?category=${selectedCategory}&search=${term}`);
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (bookId, currentStatus) => {
    const newStatus = currentStatus === 'Available' ? 'Missing' : 'Available';
    try {
      const res = await axios.post('http://localhost:5000/api/books/toggle-status', {
        book_id: bookId,
        new_status: newStatus,
      });
      if (res.data.success) {
        setBooks(prevBooks =>
          prevBooks.map(book =>
            book.id === bookId ? { ...book, status: res.data.new_status } : book
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBorrowClick = (book) => {
    navigate('/borrow-request', { state: { book } });
  };

  return (
    <div>
      <Header />
      {!selectedCategory ? (
        <div className="category-page">
          <img src="images/browse-books-bg.jpg" alt="Category" className="category-bg-image" />
          <div className="category-page-container">
            <div className="category-header">
              <h2 className="category-title">Browse Categories</h2>
              <input type="text" className="category-search" placeholder="Search categories..." />
              <button className="category-search-button">Search</button>
              <div className="category-search-results">
                {/* Render search results here */}
              </div>
              <div className="category-search-no-results">
                {/* Render no results found message here */}
              </div>
            </div>
            <div className="category-list-container">
              <ul className="category-list">
                {categories.map((cat) => (
                <li
                  key={cat}
                  className="category-item"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </li>
              ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="category-page">
          <h2 className="category-title">{selectedCategory} Books</h2>
          <div className="search-inputs-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by Title"
              onInput={(e) => handleSearch('title', e.target.value)}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Author"
              onInput={(e) => handleSearch('author', e.target.value)}
            />
          </div>

          <div className="book-container">
            <div className="book-header">
              <div className="book-title">Title</div>
              <div className="book-author">Author</div>
              <div className="book-availability-header">Availability / Action</div> {/* Consolidated header */}
            </div>

            {books.map((book) => {
              const statusClass = book.status.toLowerCase().replace(/\s/g, '-');
              const isAvailable = book.status === 'Available';

              return (
                <div key={book.id} className="book-row">
                  <div className="book-title">{book.title}</div>
                  <div className="book-author">{book.author}</div>
                  
                  {/* --- Consolidated Availability and Action --- */}
                  <div className={`book-availability-cell ${statusClass}`}> {/* Renamed for clarity */}
                    <div className="book-status-text">{book.status}</div> {/* Wrapper for status text */}
                    {userRole === 'librarian' ? (
                      <button
                        className={`btn-action toggle-btn ${isAvailable ? 'mark-missing' : 'mark-available'}`}
                        onClick={() => toggleStatus(book.id, book.status)}
                      >
                        {isAvailable ? 'Mark as Missing' : 'Mark as Available'}
                      </button>
                    ) : (
                      <button
                        className="btn-action borrow-btn"
                        onClick={() => handleBorrowClick(book)}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? 'Borrow' : 'Unavailable'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseBooks;