import React, { useEffect, useState } from 'react';
import { fetchPrompts } from '../api/api';

const PromptList = () => {
    const [prompts, setPrompts] = useState([]);

    useEffect(() => {
        const getPrompts = async () => {
            const { data } = await fetchPrompts();
            setPrompts(data);
        };
        getPrompts();
    }, []);

    return (
        <div>
            <h2>Saved Prompts</h2>
            <ul className="list-group">
                {prompts.map((prompt) => (
                    <li className="list-group-item" key={prompt._id}>
                        <h3>{prompt.title}</h3>
                        <p>{prompt.template}</p>
                        <small>Category: {prompt.category}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PromptList;
