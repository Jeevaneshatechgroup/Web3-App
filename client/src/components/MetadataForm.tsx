import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NFTAttribute } from "@shared/schema";

type MetadataFormProps = {
  onMetadataChange: (metadata: { name: string; description: string; attributes: NFTAttribute[] }) => void;
};

const MetadataForm = ({ onMetadataChange }: MetadataFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState<NFTAttribute[]>([]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    updateMetadata(e.target.value, description, attributes);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    updateMetadata(name, e.target.value, attributes);
  };

  const updateMetadata = (name: string, description: string, attributes: NFTAttribute[]) => {
    onMetadataChange({ name, description, attributes });
  };

  const addAttribute = () => {
    const newAttributes = [...attributes, { trait_type: "", value: "" }];
    setAttributes(newAttributes);
    updateMetadata(name, description, newAttributes);
  };

  const updateAttribute = (index: number, field: keyof NFTAttribute, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setAttributes(newAttributes);
    updateMetadata(name, description, newAttributes);
  };

  const removeAttribute = (index: number) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
    updateMetadata(name, description, newAttributes);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">NFT Details</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            type="text" 
            id="name" 
            placeholder="My Awesome NFT" 
            value={name}
            onChange={handleNameChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Describe your NFT..." 
            rows={3}
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Attributes (optional)</Label>
          <div className="mt-1 space-y-2">
            {attributes.map((attribute, index) => (
              <div key={index} className="flex space-x-2">
                <Input 
                  placeholder="Trait Type" 
                  value={attribute.trait_type}
                  onChange={(e) => updateAttribute(index, "trait_type", e.target.value)}
                  className="w-1/2"
                />
                <Input 
                  placeholder="Value" 
                  value={attribute.value}
                  onChange={(e) => updateAttribute(index, "value", e.target.value)}
                  className="w-1/2"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeAttribute(index)}
                  className="flex-shrink-0 h-10 w-10 text-gray-500 hover:text-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ))}
            <Button 
              type="button"
              variant="ghost"
              size="sm"
              onClick={addAttribute}
              className="flex items-center text-sm text-primary hover:text-primary/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add attribute
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataForm;
