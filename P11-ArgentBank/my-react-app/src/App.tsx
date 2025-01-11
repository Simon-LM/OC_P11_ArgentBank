import React from 'react';
import User from './components/User';
import { getUsers } from './services/userService';

const App: React.FC = () => {
    const users = getUsers();

    return (
        <div>
            <h1>Liste des utilisateurs</h1>
            {users.map(user => (
                <User key={user.id} user={user} />
            ))}
        </div>
    );
};

export default App;