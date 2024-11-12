import React, { useState } from 'react';

const NewForum = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !body) {
            setError('Title and body are required');
            return;
        }

        try {
            const response = await fetch('/api/forums', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body }),
            });

            const data = await response.json();
            if (response.ok) {
                // Redirigir al foro recién creado o al listado de foros
                window.location.href = `/forum/${data.id}`;
            } else {
                setError(data.error || 'Error creating forum');
            }
        } catch (error) {
            console.error('Error creating forum:', error);
            setError('Error creating forum');
        }
    };

    return (
        <div>
            <h1>Create Forum</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label>Body:</label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Create Forum</button>
            </form>
        </div>
    );
};

export default NewForum;