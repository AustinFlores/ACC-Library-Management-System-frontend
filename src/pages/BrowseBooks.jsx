import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import '../styles/BrowseBooks.css';


// AddEditBookForm remains the same
function AddEditBookForm({ bookToEdit, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    status: 'Available', // Default for new books
  });

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        title: bookToEdit.title,
        author: bookToEdit.author,
        isbn: bookToEdit.isbn,
        category: bookToEdit.category,
        status: bookToEdit.status,
      });
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        status: 'Available',
      });
    }
  }, [bookToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, bookToEdit ? bookToEdit.id : null);
  };

  return (
    <div className="add-edit-form-modal-overlay">
      <div className="add-edit-form-modal-content">
        <h3>{bookToEdit ? 'Edit Book' : 'Add New Book'}</h3>
        <form onSubmit={handleSubmit} className="add-edit-book-form">
          <label>Title:
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </label>
          <label>Author:
            <input type="text" name="author" value={formData.author} onChange={handleChange} required />
          </label>
          <label>ISBN:
            <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} required />
          </label>
          <label>Category:
            <input type="text" name="category" value={formData.category} onChange={handleChange} required />
          </label>
          {bookToEdit && ( // Only show status for editing
            <label>Status:
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Available">Available</option>
                <option value="Borrowed">Borrowed</option>
                <option value="Missing">Missing</option>
              </select>
            </label>
          )}
          <div className="form-actions">
            <button type="submit" className="btn-primary">{bookToEdit ? 'Update Book' : 'Add Book'}</button>
            <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BrowseBooks() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]); // what gets rendered (category page)
  const [categoryQuery, setCategoryQuery] = useState(''); // controlled input for category search

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchISBN, setSearchISBN] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null); // State for open kebab menu

  const { user } = useAuth();
  const userRole = user?.role;

  const navigate = useNavigate();
  const dropdownRefs = useRef({});
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside of any currently open dropdown
      if (
        openDropdownId &&
        dropdownRefs.current[openDropdownId] &&
        !dropdownRefs.current[openDropdownId].contains(event.target)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  // --- Fetch Categories ---
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/books/categories');
      console.log(`${BACKEND_URL}`);
      console.log('Categories response:', res.data); 
      const categoriesArray = Array.isArray(res.data) ? res.data : [];
    setCategories(categoriesArray);
      setFilteredCategories(res.data); // seed filtered list
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Category search handler (case-insensitive)
  const handleCategorySearch = () => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) {
      setFilteredCategories(categories);
      return;
    }
    const filtered = categories.filter((cat) =>
      String(cat).toLowerCase().includes(q)
    );
    setFilteredCategories(filtered);
  };

  // Keep filtered list in sync if categories update while a query exists
  useEffect(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(
        categories.filter((cat) => String(cat).toLowerCase().includes(q))
      );
    }
  }, [categories, categoryQuery]);

  // --- Fetch Books based on category and searches ---
  // Uses Axios params object, and also applies client-side fallback filtering
  const fetchBooks = async (category, title = '', author = '', isbn = '') => {
    try {
      const params = {
        category,
        // send both canonical and "searchX" names to support different backends
        title: title || undefined,
        author: author || undefined,
        isbn: isbn || undefined,
        searchTitle: title || undefined,
        searchAuthor: author || undefined,
        searchISBN: isbn || undefined,
      };

      const res = await axios.get(`${BACKEND_URL}/api/books`, { params }); // proper query params via Axios config
      let data = Array.isArray(res.data) ? res.data : [];

      // client-side fallback filtering (case-insensitive)
      const t = title.trim().toLowerCase();
      const a = author.trim().toLowerCase();
      const i = isbn.trim().toLowerCase();

      if (t) data = data.filter(b => String(b.title || '').toLowerCase().includes(t));
      if (a) data = data.filter(b => String(b.author || '').toLowerCase().includes(a));
      if (i) data = data.filter(b => String(b.isbn || '').toLowerCase().includes(i));

      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  // Trigger fetch on category or search changes
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

  // --- Librarian-specific Actions ---
  const handleAddBook = () => {
    setBookToEdit(null);
    setShowAddEditModal(true);
  };

  const handleEditBook = (book) => {
    setBookToEdit(book);
    setShowAddEditModal(true);
    setOpenDropdownId(null); // Close dropdown after selecting edit
  };

  const handleDeleteBook = async (bookId) => {
    setOpenDropdownId(null); // Close dropdown after selecting delete
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const res = await axios.delete(`${BACKEND_URL}/api/books/${bookId}`); 
      if (res.status === 200) {
        setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
        alert('Book deleted successfully!');
      } else {
        throw new Error('Failed to delete book');
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      alert('Error deleting book: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSaveBook = async (formData, bookId) => {
    try {
      if (bookId) {
        const res = await axios.put(`${BACKEND_URL}/api/books/${bookId}`, formData);
        if (res.data.success) {
          setBooks(prevBooks => prevBooks.map(book => book.id === bookId ? { ...book, ...formData } : book));
          alert('Book updated successfully!');
        } else {
          throw new Error('Failed to update book');
        }
      } else {
        const res = await axios.post(`${BACKEND_URL}/api/books`, formData);
        if (res.data.success) {
          setBooks(prevBooks => [...prevBooks, res.data.book]);
          alert('Book added successfully!');
        } else {
          throw new Error('Failed to add book');
        }
      }
      setShowAddEditModal(false);
      setBookToEdit(null);
    } catch (err) {
      console.error('Error saving book:', err);
      alert('Error saving book: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleStatus = async (bookId, currentStatus) => {
    const newStatus = currentStatus === 'Available' ? 'Borrowed' : 'Available';
    try {
      const res = await axios.post(`${BACKEND_URL}/api/books/toggle-status`, {
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
      console.error('Error toggling status:', err);
      alert('Error toggling status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleBorrowClick = (book) => {
    if (userRole !== 'student') {
      alert("Only students can borrow books. Sign in as a student to borrow.");
      return;
    }
    navigate('/borrow-request', { state: { book } });
  };

  // Determine grid columns based on role
  let gridColumns = "2fr 1.5fr 1fr 1.5fr"; // Student: Title, Author, Status, Actions
  if (userRole === 'librarian') {
    gridColumns = "2fr 1.5fr 1fr 1fr 2.5fr"; // Librarian: Title, Author, ISBN, Status, Actions (increased last column)
  }

  return (
    <div>
      <Header />
      {showAddEditModal && (
        <AddEditBookForm
          bookToEdit={bookToEdit}
          onSave={handleSaveBook}
          onCancel={() => setShowAddEditModal(false)}
        />
      )}

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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCategorySearch();
                  }
                }}
              />
              <button
                className="category-search-button"
                onClick={handleCategorySearch}
              >
                Search
              </button>
              <div className="category-search-results"></div>
              <div className="category-search-no-results"></div>
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
            {userRole === 'librarian' && (
              <input
                type="text"
                className="search-input"
                placeholder="Search by ISBN"
                value={searchISBN}
                onChange={(e) => setSearchISBN(e.target.value)}
              />
            )}

            {userRole === 'librarian' && (
              <button className="btn-primary add-book-btn" onClick={handleAddBook}>Add New Book</button>
            )}
            
            <button className="btn-secondary back-to-categories" onClick={() => setSelectedCategory(null)}>
              Back to Categories
            </button>
          </div>

          <div 
            className="book-container"
            style={{ '--book-grid-columns': gridColumns }}
          >
            <div className="book-header">
              <div className="book-title">Title</div>
              <div className="book-author">Author</div>
              {userRole === 'librarian' && <div className="book-isbn">ISBN</div>}
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
                    {userRole === 'librarian' && <div className="book-isbn">{book.isbn}</div>}
                    <div className={`book-status ${statusClass}`}>{book.status}</div>
                    
                    <div className="book-actions">
                      {userRole === 'librarian' ? (
                        <>
                          {/* Standalone Toggle Status Button */}
                          <button
                            className={`btn-action toggle-btn ${isAvailable ? 'mark-borrowed' : 'mark-available'}`}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              toggleStatus(book.id, book.status);
                            }}
                          >
                            {isAvailable ? 'Mark as Borrowed' : 'Mark as Available'}
                          </button>

                          {/* Kebab Menu Container */}
                          <div 
                            className="kebab-menu-container"
                            ref={el => { dropdownRefs.current[book.id] = el; }} // Assign ref dynamically
                          >
                            <button 
                              className="kebab-button"
                              onClick={(e) => { 
                                e.stopPropagation(); // Prevent row click if any
                                setOpenDropdownId(openDropdownId === book.id ? null : book.id);
                              }}
                            >
                              &#x22EE; {/* Vertical ellipsis character */}
                            </button>
                            {openDropdownId === book.id && (
                              <ul className="kebab-dropdown-menu">
                                <li onClick={() => handleEditBook(book)}>Edit</li>
                                <li onClick={() => handleDeleteBook(book.id)}>Delete</li>
                              </ul>
                            )}
                          </div>
                        </>
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseBooks;
