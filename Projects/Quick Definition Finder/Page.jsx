"use client";
import React from "react";

function MainComponent() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [definition, setDefinition] = React.useState("");
  const [examples, setExamples] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState("");

  const categories = [
    { name: "Everyday Vocabulary", icon: "fa-book" },
    { name: "Business Terminology", icon: "fa-briefcase" },
    { name: "Tech Speak", icon: "fa-microchip" },
    { name: "Academic Language", icon: "fa-graduation-cap" },
    { name: "Cultural Phrases", icon: "fa-globe" },
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that provides definitions and examples.",
            },
            {
              role: "user",
              content: `Define "${searchTerm}" and provide 3 contextual examples of its usage.`,
            },
          ],
        }),
      });
      const data = await response.json();
      const result = data.choices[0].message.content;
      const [def, ...exs] = result.split("\n\nExamples:");
      setDefinition(def.replace("Definition:", "").trim());
      setExamples(exs[0].split("\n").filter((ex) => ex.trim()));
    } catch (error) {
      console.error("Error fetching definition:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      const response = await fetch(
        `/integrations/google-search/search?q=${encodeURIComponent(
          value
        )} definition`
      );
      const data = await response.json();
      setSuggestions(
        data.items.slice(0, 5).map((item) => item.title.split(" - ")[0])
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that provides examples of terms in specific categories.",
            },
            {
              role: "user",
              content: `Provide 5 example terms for the category "${category}" along with their brief definitions.`,
            },
          ],
        }),
      });
      const data = await response.json();
      const result = data.choices[0].message.content;
      const examples = result.split("\n").filter((line) => line.trim());
      setExamples(examples);
      setDefinition("");
    } catch (error) {
      console.error("Error fetching category examples:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800">
            Quick Definition Finder
          </h1>
          <div className="relative mb-8">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Enter a word, phrase, or jargon..."
              className="w-full px-4 py-3 rounded-full border-2 border-indigo-300 focus:outline-none focus:border-indigo-500 text-lg"
            />
            <button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || loading}
              className="absolute right-2 top-2 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-search"></i>
              )}
            </button>
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-indigo-100 cursor-pointer"
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">
              Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg transition duration-300 ease-in-out ${
                    selectedCategory === category.name
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                  }`}
                >
                  <i className={`fas ${category.icon} text-2xl mb-2`}></i>
                  <span className="text-sm text-center">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          {definition && (
            <div className="mb-8 p-6 bg-indigo-50 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
                Definition
              </h2>
              <p className="text-lg text-gray-700">{definition}</p>
            </div>
          )}
          {examples.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
                Examples
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                {examples.map((example, index) => (
                  <li key={index} className="text-lg text-gray-700">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
