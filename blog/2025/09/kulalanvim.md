---
slug: kulala-in-neovim
title: Supercharge your API workflow with Kulala in Neovim
tags: [neovim]
keywords:
  - http
  - kulala
  - nvim
  - lazyvim
last_updated:
  date: 2025-09-27
---

If you're a developer like me who lives in Neovim and frequently works with APIs, you've probably bounced between different tools for testing HTTP requests. Maybe you've used Postman, httpie, or curl commands scattered across your terminal history. But what if I told you there's a better way—one that keeps you in your favorite editor and treats your API requests as code?

<!-- truncate -->

Enter `.http` files and kulala.nvim, a powerful combination that brings REST API testing directly into your Neovim workflow.

### What Are .http Files?

`.http` files (also known as HTTP request files) are plain text files that contain HTTP requests in a human-readable format. They originated from JetBrains IDEs but have since been adopted by various editors and tools, including VS Code's REST Client extension.

The beauty of `.http` files lies in their simplicity. Instead of clicking through a GUI or remembering complex curl syntax, you write your HTTP requests in a declarative format that's easy to read, version control, and share with your team.

Here's what a basic `.http` file looks like:

```http
### Get all users
GET https://api.example.com/users
Accept: application/json

### Create a new user
POST https://api.example.com/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Key Features of .http Files

### 1. Request Separation

Use `###` to separate different requests in the same file. Each request can be executed independently.

### 2. Headers

Add headers right after the request line, one per line:

```http
GET https://api.example.com/protected
Authorization: Bearer your-token-here
User-Agent: MyApp/1.0
Accept: application/json
```

### 3. Request Bodies

For POST, PUT, and PATCH requests, add a blank line after headers and include your request body:

```http
POST https://api.example.com/posts
Content-Type: application/json

{
  "title": "My Post",
  "content": "This is the content"
}
```

### 4. Variables

Define and reuse variables to avoid repetition:

```http
@baseUrl = https://api.example.com
@token = your-auth-token

GET {{baseUrl}}/users
Authorization: Bearer {{token}}
```

### 5. Comments

Use `#` or `//` for comments to document your requests:

```http
# This endpoint returns all active users
GET https://api.example.com/users?status=active
```

## Enter kulala.nvim

While `.http` files are useful on their own, they really shine when paired with a good client. For Neovim users, kulala.nvim is the perfect companion. It's a lightweight, fast HTTP client plugin that brings the power of `.http` files directly into your editor.

### Why kulala.nvim?

1. **Native Neovim Integration**: No need to leave your editor
2. **Lightweight**: Minimal overhead, fast execution
3. **Feature-rich**: Supports all standard HTTP methods, headers, and body types
4. **Variable Support**: Full support for environment variables and file-scoped variables
5. **Response Handling**: View responses in a dedicated buffer with syntax highlighting

## Setting Up kulala.nvim

### Installation

Using [lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{
  'mistweaverco/kulala.nvim',
  config = function()
    require('kulala').setup({
      -- Default request timeout
      default_timeout = 5000,
      -- Show icons in the request list
      icons = {
        inlay = {
          loading = "⏳",
          done = "✅"
        },
        lualine = "🐼"
      },
    })
  end
}
```

### Basic Configuration

Add some keybindings to make kulala.nvim easy to use:

```lua
vim.keymap.set("n", "<leader>rr", require('kulala').run, { desc = "Execute HTTP request" })
vim.keymap.set("n", "<leader>ra", require('kulala').run_all, { desc = "Execute all HTTP requests" })
vim.keymap.set("n", "<leader>ri", require('kulala').inspect, { desc = "Inspect HTTP request" })
vim.keymap.set("n", "<leader>rt", require('kulala').toggle_view, { desc = "Toggle response view" })
```

## Practical Examples

Let's walk through some practical examples of using `.http` files with kulala.nvim.

### Example 1: Basic CRUD Operations

```http
@baseUrl = https://jsonplaceholder.typicode.com

### Get all posts
GET {{baseUrl}}/posts

### Get specific post
GET {{baseUrl}}/posts/1

### Create new post
POST {{baseUrl}}/posts
Content-Type: application/json

{
  "title": "My New Post",
  "body": "This is the content of my post",
  "userId": 1
}

### Update post
PUT {{baseUrl}}/posts/1
Content-Type: application/json

{
  "id": 1,
  "title": "Updated Post Title",
  "body": "Updated content",
  "userId": 1
}

### Delete post
DELETE {{baseUrl}}/posts/1
```

### Example 2: Authentication Flow

```http
@authUrl = https://api.example.com
@username = your-username
@password = your-password

### Login to get token
POST {{authUrl}}/auth/login
Content-Type: application/json

{
  "username": "{{username}}",
  "password": "{{password}}"
}

### Use the token (you'll need to copy it from the login response)
@token = your-jwt-token-here

### Get protected resource
GET {{authUrl}}/protected
Authorization: Bearer {{token}}

### Refresh token
POST {{authUrl}}/auth/refresh
Authorization: Bearer {{token}}
```

## Advanced Features

### Environment Files

kulala.nvim supports environment-specific variables through `.env` files:

Create a `http-client.env.json` file:

```json
{
  "dev": {
    "baseUrl": "https://api-dev.example.com",
    "token": "dev-token"
  },
  "prod": {
    "baseUrl": "https://api.example.com",
    "token": "prod-token"
  }
}
```

Then use variables in your `.http` file:

```http
GET {{baseUrl}}/users
Authorization: Bearer {{token}}
```

### Response Testing

You can even write simple tests for your responses:

```http
GET https://api.example.com/users

> {%
  client.test("Status is 200", function() {
    client.assert(response.status === 200, "Expected status 200");
  });

  client.test("Response has users", function() {
    client.assert(response.body.length > 0, "Expected users in response");
  });
%}
```

## Best Practices

### 1. Organize by Feature

Create separate `.http` files for different API endpoints or features:

- `auth.http` - Authentication endpoints
- `users.http` - User management
- `posts.http` - Content operations

### 2. Use Variables Liberally

Define common values as variables to make maintenance easier:

```http
@apiVersion = v1
@contentType = application/json
@baseUrl = https://api.example.com/{{apiVersion}}
```

### 3. Document Your Requests

Use comments to explain what each request does:

```http
### Creates a new user account
### Requires admin privileges
POST {{baseUrl}}/users
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "role": "user"
}
```

### 4. Version Control

Commit your `.http` files to version control. They serve as living documentation of your API and make it easy for team members to test endpoints.

### 5. Separate Sensitive Data

Never commit sensitive data like API keys. Use environment files or variables that can be set locally:

```http
# ❌ Don't do this
Authorization: Bearer sk-1234567890abcdef

# ✅ Do this instead
Authorization: Bearer {{apiKey}}
```

## Workflow Integration

### Testing During Development

Keep a `.http` file open in a split while you're developing your API. Make a change to your backend code, save, and immediately test it with `<leader>rr`.

### API Documentation

Your `.http` files serve as executable documentation. New team members can understand your API by looking at and running the requests.

### CI/CD Integration

Some tools can run `.http` files as part of your CI/CD pipeline, turning them into integration tests.

## Conclusion

`.http` files combined with kulala.nvim offer a powerful, lightweight solution for API development and testing. They keep you in your editor, provide version-controllable API documentation, and make testing as simple as pressing a key combination.

If you're tired of context-switching between your editor and external HTTP clients, give this combo a try. Your workflow will thank you.

The best part? Your `.http` files are portable. If you switch editors or tools, your requests go with you. They're just text files, after all—but text files that can supercharge your API development workflow.

Ready to give it a shot? Start with a simple `.http` file, install kulala.nvim, and begin exploring your APIs without ever leaving Neovim.
