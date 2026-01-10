import React from "react";
import { Edit3 } from "lucide-react";
import { Input, TextArea, Button, Card } from "../../components/ui";

interface TextInputProps {
  title: string;
  text: string;
  onTitleChange: (title: string) => void;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  title,
  text,
  onTitleChange,
  onTextChange,
  onAnalyze,
  disabled = false,
}) => {
  return (
    <Card padding="lg" className="text-left">
      <div className="mb-4">
        <Input
          type="text"
          label="Title (Optional)"
          placeholder="e.g. Homepage Draft"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="mb-4">
        <TextArea
          label="Content to Analyze"
          className="h-40"
          placeholder="Paste your text here..."
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onAnalyze}
          disabled={!text || disabled}
          icon={<Edit3 size={16} />}
        >
          Analyze Text
        </Button>
      </div>
    </Card>
  );
};
