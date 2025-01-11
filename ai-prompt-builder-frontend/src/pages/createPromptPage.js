import React from "react";
import { createPrompt } from "../api/api";
import CreatePrompt from "../components/createPrompt";

const CreatePromptPage = () => {
  const handleCreatePrompt = async (newPrompt) => {
    await createPrompt(newPrompt);
    alert("Prompt created successfully!");
  };

  return (
    <div>
      <CreatePrompt onSubmit={handleCreatePrompt} />
    </div>
  );
};

export default CreatePromptPage;
