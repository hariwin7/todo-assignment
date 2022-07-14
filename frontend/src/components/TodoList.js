import React, { useCallback } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Paper, Box } from "@mui/material";
import Stack from "@mui/material/Stack";
import InfiniteScroll from "react-infinite-scroll-component";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { TodoCard } from "./TodoCard";
import update from "immutability-helper";
const useStyles = makeStyles({
  todosContainer: { marginTop: 10, padding: 10 },
});
function TodoList({
  todos,
  toggleTodoCompleted,
  deleteTodo,
  pagination,
  handleNext,
  setTodos,
}) {
  const classes = useStyles();

  const findCard = useCallback(
    (id) => {
      const card = todos.filter((c) => `${c.id}` === id)[0];
      return {
        card,
        index: todos.indexOf(card),
      };
    },
    [todos]
  );
  const moveCard = useCallback(
    (id, atIndex) => {
      const { card, index } = findCard(id);
      setTodos(
        update(todos, {
          $splice: [
            [index, 1],
            [atIndex, 0, card],
          ],
        })
      );
    },
    [findCard, todos, setTodos]
  );
  const renderCard = useCallback(
    (
      id,
      text,
      completed,
      index,
      order,
      toggleTodoCompleted,
      deleteTodo,
      handleUpdate
    ) => {
      return (
        <TodoCard
          key={id}
          index={index}
          order={order}
          id={id}
          text={text}
          completed={completed}
          moveCard={moveCard}
          deleteTodo={deleteTodo}
          toggleTodoCompleted={toggleTodoCompleted}
          handleUpdate={handleUpdate}
          findCard={findCard}
        />
      );
    },
    [moveCard, findCard]
  );
  function handleUpdate(item) {
    const payload = { ...item, newOrder: item.index + 1 };
    fetch(`http://localhost:3001/update-order/`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(payload),
    })
      .then(() => {
        console.log("djdh");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <Stack spacing={2}>
      <DndProvider backend={HTML5Backend}>
        <InfiniteScroll
          dataLength={todos.length}
          next={() => handleNext(todos.length)}
          hasMore={pagination.hasMore}
          loader={<h4>Loading...</h4>}
          height={350}
        >
          {todos.length > 0 && (
            <Paper className={classes.todosContainer}>
              <Box display="flex" flexDirection="column" alignItems="stretch">
                {todos.map(({ id, text, completed, order }, index) =>
                  renderCard(
                    id,
                    text,
                    completed,
                    index,
                    order,
                    toggleTodoCompleted,
                    deleteTodo,
                    handleUpdate
                  )
                )}
              </Box>
            </Paper>
          )}
        </InfiniteScroll>
      </DndProvider>
    </Stack>
  );
}

export default TodoList;
