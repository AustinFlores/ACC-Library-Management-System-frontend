// 📄 src/pages/BrowseBooks.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import '../styles/BrowseBooks.css';

function BrowseBooks() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchISBN, setSearchISBN] = useState('');

  const { user } = useAuth();
  const userRole = user?.role;
  const navigate = useNavigate();
  const URL = "https://acc-library-management-system-backend-1.onrender.com";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${URL}/api/books/categories`);
      setCategories(res.data);
      setFilteredCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((cat) =>
        String(cat).toLowerCase().includes(q)
      );
      setFilteredCategories(filtered);
    }
  }, [categoryQuery, categories]);

  const fetchBooks = async (category, title = '', author = '', isbn = '') => {
    try {
      const params = { category, title, author, isbn };
      const res = await axios.get(`${URL}/api/books`, { params });
      let data = Array.isArray(res.data) ? res.data : [];

      const t = title.trim().toLowerCase();
      const a = author.trim().toLowerCase();

      if (t) data = data.filter(b => String(b.title || '').toLowerCase().includes(t));
      if (a) data = data.filter(b => String(b.author || '').toLowerCase().includes(a));

      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchBooks(selectedCategory, searchTitle, searchAuthor, searchISBN);
    }
  }, [selectedCategory, searchTitle, searchAuthor, searchISBN]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchTitle('');
    setSearchAuthor('');
    setSearchISBN('');
  };

  const handleBorrowClick = (book) => {
    if (userRole !== 'student') {
      alert("Only students can borrow books. Sign in as a student to borrow.");
      return;
    }
    navigate('/borrow-request', { state: { book } });
  };

  const gridColumns = "2fr 1.5fr 1fr 1.5fr";

  return (
    <div>
      <Header />
      {!selectedCategory ? (
        <div className="category-page">
          <img src="/images/browse-books-bg.jpg" alt="Category" className="category-bg-image" />
          <div className="category-page-container">
            <div className="category-header">
              <h2 className="category-title">Browse Categories</h2>
              <input
                type="text"
                className="category-search"
                placeholder="Search categories..."
                value={categoryQuery}
                onChange={(e) => setCategoryQuery(e.target.value)}
              />
            </div>

            <div className="category-list-container">
              {filteredCategories.length === 0 ? (
                <p className="no-books-found">No categories match the search.</p>
              ) : (
                <ul className="category-list">
                  {filteredCategories.map((cat) => (
                    <li
                      key={cat}
                      className="category-item"
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="category-disclaimer">
              Disclaimer: Each category showcases all existing books that are part of our library’s collection.
            </p>
          </div>
        </div>
      ) : (
        <div className="category-page book-list-view">
          <h2 className="category-title">{selectedCategory} Books</h2>

          <div className="search-inputs-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by Title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Author"
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
            />
            <button
              className="btn-secondary back-to-categories"
              onClick={() => setSelectedCategory(null)}
            >
              Back to Categories
            </button>
          </div>

          <div className="book-container" style={{ '--book-grid-columns': gridColumns }}>
            <div className="book-header">
              <div className="book-title">Title</div>
              <div className="book-author">Author</div>
              <div className="book-status">Status</div>
              <div className="book-actions">Actions</div>
            </div>

            {books.length === 0 ? (
              <p className="no-books-found">No books found in this category or matching your search.</p>
            ) : (
              books.map((book) => {
                const statusClass = book.status.toLowerCase().replace(/\s/g, '-');
                const isAvailable = book.status === 'Available';

                return (
                  <div key={book.id} className="book-row">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">{book.author}</div>
                    <div className={`book-status ${statusClass}`}>{book.status}</div>
                    <div className="book-actions">
                      <button
                        className="btn-action borrow-btn"
                        onClick={() => handleBorrowClick(book)}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? 'Borrow' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseBooks;
