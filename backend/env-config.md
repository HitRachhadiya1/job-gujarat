# Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Auth0 Configuration
AUTH0_DOMAIN=dev-oywmbfaftloq7rl1.us.auth0.com
AUTH0_CLIENT_ID=dpvm0hpIHYozwvJql25dkQ7ZCUrKxxZO
AUTH0_CLIENT_SECRET=YOUR_AUTH0_CLIENT_SECRET_HERE
AUTH0_AUDIENCE=https://dev-oywmbfaftloq7rl1.us.auth0.com/api/v2/

# Server Configuration
PORT=5000

# Database Configuration (if using Prisma)
DATABASE_URL="your_database_url_here"
```

## How to get the Auth0 Client Secret:

1. Go to your Auth0 Dashboard
2. Navigate to Applications > Applications
3. Find your application (the one with client ID: dpvm0hpIHYozwvJql25dkQ7ZCUrKxxZO)
4. Go to the "Settings" tab
5. Copy the "Client Secret" value
6. Replace `YOUR_AUTH0_CLIENT_SECRET_HERE` with the actual secret

## Important Notes:
- Never commit the `.env` file to version control
- The `.env` file should be in the backend directory
- After creating the `.env` file, restart the backend server 