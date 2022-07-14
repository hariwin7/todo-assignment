import { useEffect, useState, useCallback } from "react";
import * as dayjs from "dayjs";
import { initialPagination } from "../constants/paginationConstants";

function useFetchTodo({ filterDueDate, pagination }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getTodos = useCallback((filterDueDate, pagination, items = []) => {
    setLoading(true);
    fetch(
      `http://localhost:3001/${pagination.skip}/${
        filterDueDate ? `${dayjs(filterDueDate).format("DD-MM-YYYY")}` : ""
      }`
    )
      .then((response) => response.json())
      .then((todo) => {
        setPage(todo.pagination);
        setData([...items, ...todo.data]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    getTodos(filterDueDate, pagination);
    // eslint-disable-next-line
  }, []);

  return [{ data, page, loading, error }, getTodos];
}

export default useFetchTodo;
