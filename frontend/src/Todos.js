import { useState, useEffect } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Container,
  Typography,
  Button,
  Icon,
  Paper,
  Box,
  TextField,
} from "@mui/material";
import * as dayjs from "dayjs";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TodoList from "./components/TodoList";

import useFetchTodo from "./hooks/useFetchTodo";
import { initialPagination } from "./constants/paginationConstants";
const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
  filterContainer: { padding: 10, marginTop: 10 },
});

function Todos() {
  const classes = useStyles();
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");

  const [dueDate, setDueDate] = useState(new Date());
  const [filterDueDate, setFilterDueDate] = useState(null);
  const [pagination, setPagination] = useState(initialPagination);
  const [validationError, setValidationError] = useState("");
  const [dateValidation, setDateValidation] = useState("");
  const [{ data, page }, getTodos] = useFetchTodo({
    filterDueDate,
    pagination,
  });

  useEffect(() => {
    setTodos(data);
  }, [data]);

  useEffect(() => {
    setPagination(page);
    console.log(page);
  }, [page]);

  function addTodo(text) {
    if (!text) {
      setValidationError("cannot be blank");
      return;
    }
    const formattedDate = dayjs(dueDate).format("DD-MM-YYYY");
    if (formattedDate === "Invalid Date") {
      setDateValidation("cannot be blank");
      return;
    }

    fetch("http://localhost:3001/", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        text,
        dueDate: formattedDate,
        order: todos.length ? todos[todos.length - 1].order + 1 : 1,
      }),
    })
      .then((response) => response.json())
      .then((todo) => {
        if (
          (!filterDueDate ||
            dayjs(filterDueDate).format("DD-MM-YYYY") === todo.dueDate) &&
          pagination.totalCount <= todos.length
        )
          setTodos([...todos, todo]);
      })
      .catch((err) => {
        console.log(err);
      });
    setNewTodoText("");
  }

  function toggleTodoCompleted(id) {
    fetch(`http://localhost:3001/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        completed: !todos.find((todo) => todo.id === id).completed,
      }),
    })
      .then(() => {
        const newTodos = [...todos];
        const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
        newTodos[modifiedTodoIndex] = {
          ...newTodos[modifiedTodoIndex],
          completed: !newTodos[modifiedTodoIndex].completed,
        };
        setTodos(newTodos);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function deleteTodo(id) {
    fetch(`http://localhost:3001/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setTodos(todos.filter((todo) => todo.id !== id));
        if (todos.length < pagination.pageSize) {
          getTodos(filterDueDate, initialPagination);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Todos
      </Typography>
      <Paper className={classes.addTodoContainer}>
        <Box display="flex" flexDirection="row" gap={2}>
          <Box flexGrow={1}>
            <TextField
              error={validationError !== ""}
              helperText={validationError}
              fullWidth
              value={newTodoText}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  addTodo(newTodoText);
                }
              }}
              onChange={(event) => {
                setValidationError("");
                setNewTodoText(event.target.value);
              }}
            />
          </Box>
          <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disablePast
                label="Due date"
                value={dueDate}
                onChange={(newValue) => {
                  setDateValidation("");
                  setDueDate(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    error={dateValidation !== ""}
                    helperText={dateValidation}
                    {...params}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
          <Button
            className={classes.addTodoButton}
            startIcon={<Icon>add</Icon>}
            onClick={() => addTodo(newTodoText)}
          >
            Add
          </Button>
        </Box>
      </Paper>
      <Paper className={classes.filterContainer}>
        <Box display="flex" flexDirection="row" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Filter by due date"
              value={filterDueDate}
              onChange={(newValue) => {
                setFilterDueDate(newValue);
                getTodos(newValue, initialPagination);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Box>
      </Paper>
      <TodoList
        todos={todos}
        setTodos={setTodos}
        toggleTodoCompleted={toggleTodoCompleted}
        deleteTodo={deleteTodo}
        handleNext={(newSkip) => {
          console.log("handle next", newSkip);
          setPagination((prev) => ({
            ...prev,
            skip: newSkip,
          }));
          getTodos(filterDueDate, { ...pagination, skip: newSkip }, todos);
        }}
        pagination={pagination}
      />
    </Container>
  );
}

export default Todos;
