import React from 'react';
import { User as UserModel } from '../../models/User';

interface UserProps {
    user: UserModel;
}

const User: React.FC<UserProps> = ({ user }) => {
    return (
        <div>
            <h2>{user.firstName} {user.lastName}</h2>
            <p>Nom d'utilisateur: {user.userName}</p>
            <p>Email: {user.email}</p>
        </div>
    );
};

export default User;