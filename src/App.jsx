import React from "react";
import { useEffect, useMemo, useState } from "react";

const sampleBooks = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Development",
    year: "2018",
    isbn: "9780735211292",
    status: "Available"
  },
  {
    id: 2,
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    year: "1988",
    isbn: "9780062315007",
    status: "Borrowed"
  },
  {
    id: 3,
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Programming",
    year: "2008",
    isbn: "9780132350884",
    status: "Available"
  },
  {
    id: 4,
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    category: "Business",
    year: "1997",
    isbn: "9781612681139",
    status: "Available"
  },
  {
    id: 5,
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    category: "Programming",
    year: "1999",
    isbn: "9780135957059",
    status: "Available"
  }
];

const emptyForm = {
  title: "",
  author: "",
  category: "Programming",
  year: "",
  isbn: "",
  status: "Available"
};

function App() {
  const [page, setPage] = useState("Dashboard");
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem("book-library-books");
    return saved ? JSON.parse(saved) : sampleBooks;
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("book-library-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem("book-library-books", JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem("book-library-history", JSON.stringify(history));
  }, [history]);

  const categories = useMemo(
    () => [...new Set(books.map((book) => book.category))],
    [books]
  );

  const filteredBooks = useMemo(() => {
    const value = search.toLowerCase().trim();

    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(value) ||
        book.author.toLowerCase().includes(value) ||
        book.isbn.toLowerCase().includes(value);

      const matchesCategory =
        categoryFilter === "All" || book.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, categoryFilter]);

  const availableBooks = books.filter(
    (book) => book.status === "Available"
  ).length;

  const borrowedBooks = books.filter(
    (book) => book.status === "Borrowed"
  ).length;

  function openAddModal() {
    setForm(emptyForm);
    setModal("add");
  }

  function openEditModal(book) {
    setForm({ ...book });
    setModal(book);
  }

  function closeModal() {
    setModal(null);
    setForm(emptyForm);
  }

  function handleFormChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  function saveBook(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.author.trim() || !form.category.trim()) {
      return;
    }

    if (modal === "add") {
      setBooks([
        ...books,
        {
          ...form,
          id: Date.now()
        }
      ]);
    } else {
      setBooks(
        books.map((book) =>
          book.id === modal.id
            ? {
                ...form,
                id: modal.id
              }
            : book
        )
      );
    }

    closeModal();
  }

  function deleteBook(id) {
    const confirmed = window.confirm("Delete this book?");
    if (!confirmed) return;

    setBooks(books.filter((book) => book.id !== id));
  }

  function borrowBook(book) {
    if (book.status === "Borrowed") return;

    const date = new Date().toLocaleDateString();

    setBooks(
      books.map((item) =>
        item.id === book.id
          ? { ...item, status: "Borrowed" }
          : item
      )
    );

    setHistory([
      {
        id: Date.now(),
        bookId: book.id,
        title: book.title,
        action: "Borrowed",
        date
      },
      ...history
    ]);
  }

  function returnBook(book) {
    if (book.status === "Available") return;

    const date = new Date().toLocaleDateString();

    setBooks(
      books.map((item) =>
        item.id === book.id
          ? { ...item, status: "Available" }
          : item
      )
    );

    setHistory([
      {
        id: Date.now(),
        bookId: book.id,
        title: book.title,
        action: "Returned",
        date
      },
      ...history
    ]);
  }

  function resetData() {
    const confirmed = window.confirm("Reset the library to sample data?");
    if (!confirmed) return;

    setBooks(sampleBooks);
    setHistory([]);
    setSearch("");
    setCategoryFilter("All");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          Book<span>Library</span>
        </div>

        <nav className="nav">
          {["Dashboard", "Books", "Categories", "Borrowing History"].map(
            (item) => (
              <button
                key={item}
                className={page === item ? "active" : ""}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            )
          )}
        </nav>

        <div className="sidebar-footer">Personal Library Manager</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{page}</h1>
            <p>Manage books, categories and borrowing activity.</p>
          </div>

          {page === "Books" && (
            <button className="primary-button" onClick={openAddModal}>
              + Add Book
            </button>
          )}
        </header>

        {page === "Dashboard" && (
          <Dashboard
            books={books}
            availableBooks={availableBooks}
            borrowedBooks={borrowedBooks}
            categories={categories}
          />
        )}

        {page === "Books" && (
          <BooksPage
            books={filteredBooks}
            categories={categories}
            search={search}
            setSearch={setSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            borrowBook={borrowBook}
            returnBook={returnBook}
            openEditModal={openEditModal}
            deleteBook={deleteBook}
          />
        )}

        {page === "Categories" && (
          <CategoriesPage books={books} categories={categories} />
        )}

        {page === "Borrowing History" && (
          <HistoryPage history={history} />
        )}

        <button className="reset-button" onClick={resetData}>
          Reset Sample Data
        </button>
      </main>

      {modal && (
        <BookModal
          modal={modal}
          form={form}
          onChange={handleFormChange}
          onSubmit={saveBook}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function Dashboard({
  books,
  availableBooks,
  borrowedBooks,
  categories
}) {
  return (
    <>
      <section className="stats-grid">
        <StatCard label="Total Books" value={books.length} />
        <StatCard label="Available" value={availableBooks} />
        <StatCard label="Borrowed" value={borrowedBooks} />
        <StatCard label="Categories" value={categories.length} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Books</h2>
            <p>Books currently registered in the library.</p>
          </div>
        </div>

        <BookTable books={books.slice(0, 5)} dashboard />
      </section>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BooksPage({
  books,
  categories,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  borrowBook,
  returnBook,
  openEditModal,
  deleteBook
}) {
  return (
    <>
      <div className="toolbar">
        <input
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, author or ISBN..."
        />

        <select
          className="select-input"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <section className="panel">
        <BookTable
          books={books}
          borrowBook={borrowBook}
          returnBook={returnBook}
          openEditModal={openEditModal}
          deleteBook={deleteBook}
        />
      </section>
    </>
  );
}

function BookTable({
  books,
  dashboard = false,
  borrowBook,
  returnBook,
  openEditModal,
  deleteBook
}) {
  if (dashboard) {
    return (
      <div className="table-wrap">
        <table className="book-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>
                  <strong>{book.title}</strong>
                </td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>
                  <StatusBadge status={book.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="book-table">
        <thead>
          <tr>
            <th>Book</th>
            <th>Author</th>
            <th>Category</th>
            <th>Year</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {books.length > 0 ? (
            books.map((book) => (
              <tr key={book.id}>
                <td>
                  <strong>{book.title}</strong>
                  <small>{book.isbn || "No ISBN"}</small>
                </td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>{book.year || "-"}</td>
                <td>
                  <StatusBadge status={book.status} />
                </td>
                <td>
                  <div className="actions">
                    {book.status === "Available" ? (
                      <button
                        className="action-button"
                        onClick={() => borrowBook(book)}
                      >
                        Borrow
                      </button>
                    ) : (
                      <button
                        className="action-button"
                        onClick={() => returnBook(book)}
                      >
                        Return
                      </button>
                    )}

                    <button
                      className="action-button"
                      onClick={() => openEditModal(book)}
                    >
                      Edit
                    </button>

                    <button
                      className="action-button danger"
                      onClick={() => deleteBook(book.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="empty-state">
                No books found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`status-badge ${
        status === "Available" ? "available" : "borrowed"
      }`}
    >
      {status}
    </span>
  );
}

function CategoriesPage({ books, categories }) {
  return (
    <section className="category-grid">
      {categories.map((category) => (
        <div className="category-card" key={category}>
          <div className="category-icon">📚</div>
          <h3>{category}</h3>
          <p>
            {books.filter((book) => book.category === category).length} book(s)
          </p>
        </div>
      ))}
    </section>
  );
}

function HistoryPage({ history }) {
  if (history.length === 0) {
    return (
      <section className="panel empty-history">
        <h2>No Borrowing Activity</h2>
        <p>Borrow a book to create borrowing history.</p>
      </section>
    );
  }

  return (
    <section className="history-list">
      {history.map((item) => (
        <div className="history-card" key={item.id}>
          <div>
            <h3>{item.title}</h3>
            <p>Book ID: {item.bookId}</p>
          </div>

          <div className="history-right">
            <StatusBadge
              status={item.action === "Borrowed" ? "Borrowed" : "Available"}
            />
            <span>{item.action}</span>
            <small>{item.date}</small>
          </div>
        </div>
      ))}
    </section>
  );
}

function BookModal({
  modal,
  form,
  onChange,
  onSubmit,
  onClose
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{modal === "add" ? "Add New Book" : "Edit Book"}</h2>
            <p>Enter the book information below.</p>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label className="full">
              Book Title
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                required
              />
            </label>

            <label>
              Author
              <input
                name="author"
                value={form.author}
                onChange={onChange}
                required
              />
            </label>

            <label>
              Category
              <input
                name="category"
                value={form.category}
                onChange={onChange}
                required
              />
            </label>

            <label>
              Publication Year
              <input
                name="year"
                value={form.year}
                onChange={onChange}
              />
            </label>

            <label>
              ISBN
              <input
                name="isbn"
                value={form.isbn}
                onChange={onChange}
              />
            </label>

            <label className="full">
              Status
              <select
                name="status"
                value={form.status}
                onChange={onChange}
              >
                <option>Available</option>
                <option>Borrowed</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button">
              Save Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;