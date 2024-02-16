import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const ElementsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
  parentElements: [
    {
      type: Array,
      required: true,
    },
  ],
});

const Elements = models.Elements || model("Elements", ElementsSchema);

export default Elements;
