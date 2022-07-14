import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Typography, Button, Icon, Box, Checkbox } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
const style = {
  border: "1px solid gray",
  padding: "0.5rem 1rem",
  marginBottom: ".5rem",
  backgroundColor: "white",
  cursor: "move",
};

const useStyles = makeStyles({
  todoContainer: {
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});
export const TodoCard = ({
  id,
  text,
  index,
  order,
  moveCard,
  completed,
  toggleTodoCompleted,
  deleteTodo,
  handleUpdate,
  findCard,
}) => {
  const classes = useStyles();
  const ref = useRef(null);
  const originalIndex = findCard(id).index;
  const [, drop] = useDrop(
    () => ({
      accept: "card",
      hover({ id: draggedId }) {
        if (draggedId !== id) {
          const { index: overIndex } = findCard(id);
          moveCard(draggedId, overIndex);
        }
      },
    }),
    [findCard, moveCard]
  );

  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: () => {
      return { id, index, order, originalIndex };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const { id: droppedId, originalIndex } = item;
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        moveCard(droppedId, originalIndex);
      } else {
        handleUpdate({ ...item, index });
      }
    },
  });
  const opacity = isDragging ? 0 : 1;

  drag(drop(ref));
  return (
    <div ref={ref} style={{ ...style, opacity }}>
      <Box
        key={id}
        display="flex"
        flexDirection="row"
        alignItems="center"
        className={classes.todoContainer}
      >
        <Checkbox
          checked={completed}
          onChange={() => toggleTodoCompleted(id)}
        ></Checkbox>
        <Box flexGrow={1}>
          <Typography
            className={completed ? classes.todoTextCompleted : ""}
            variant="body1"
          >
            {text}
          </Typography>
        </Box>
        <Button
          className={classes.deleteTodo}
          startIcon={<Icon>delete</Icon>}
          onClick={() => deleteTodo(id)}
        >
          Delete
        </Button>
      </Box>
    </div>
  );
};
