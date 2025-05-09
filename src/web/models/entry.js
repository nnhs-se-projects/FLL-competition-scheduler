/**
 * FLL Competition Scheduler - Entry Model
 *
 * This file defines the schema for journal entries.
 */

import mongoose from "mongoose";

const schema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  habit: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Entry = mongoose.model("Entry", schema);

export default Entry;
