import React, { useEffect, useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import "./App.css";

const SearchQuestions = () => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [type, setType] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (keyword) => {
    try {
      const res = await fetch(`http://localhost:5000/suggestions?query=${keyword}`);
      if (!res.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error(err.message);
    }
  };

  const searchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("http://localhost:5000/search");
      const params = { page, limit, type };
      if (query) {
        params.query = query;
      }
      Object.keys(params).forEach((key) => params[key] === "" && delete params[key]);
      url.search = new URLSearchParams(params).toString();
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await res.json();
      setQuestions(data.questions);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        fetchSuggestions(query);
        searchQuestions();
      } else {
        setSuggestions([]);
        setQuestions([]);
        setTotalCount(0);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, page, type]);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container">
      <h1 className="heading">Search Questions</h1>

      <div className="search-filter-container">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search questions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="suggestion-item"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select
            className="dropdown-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All</option>
            <option value="MCQ">MCQ</option>
            <option value="ANAGRAM">ANAGRAM</option>
            <option value="READ_ALONG">READ_ALONG</option>
            <option value="CONTENT_ONLY">CONTENT_ONLY</option>
          </select>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading && !error && <div className="spinner">Loading...</div>}

      {questions.length > 0 && (
        <div>
          <h5>{totalCount} Questions Found</h5>
          <ul className="questions-list">
            {questions.map((question) => (
              <li key={question.id} className="question-item">
                <strong>{question.title}</strong> ({question.type})
                {question.type === "MCQ" && (
                  <ul>
                    {question.options.map((option, index) => (
                      <li key={index}>{option.text}</li>
                    ))}
                  </ul>
                )}
                {question.type === "ANAGRAM" && (
                  <ul>
                    {question.blocks.map((block, index) => (
                      <li key={index}>{block.text}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {questions.length === 0 && !loading && !error && query && (
        <div className="alert info">No questions found.</div>
      )}
    </div>
  );
};

export default SearchQuestions;
