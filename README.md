# MCP Prefactor Demo

A demonstration MCP (Model Context Protocol) server that implements MCP Authorization using Prefactor.

## Overview

This project demonstrates how to build an MCP server with MCP Authorization support. The server runs in stateless mode, 
creating new transport and server instances for each request to ensure complete isolation between concurrent clients.

## Features

- MCP Authorization support
- Stateless request handling
- CORS support so that MCP Inspector works as expected
- Two example tools:
  - `add`: Adds two numbers
  - `whoami`: Returns authenticated user information

## Architecture

The server consists of three main components:

- **Server** (`src/server.mts`): Defines the MCP server with tool registrations
- **Authentication Middleware** (`src/authMiddleware.mts`): Handles MCP Authorization token validation and resource metadata
- **HTTP Server** (`src/index.mts`): Express.js application that ties everything together

## MCP Authorization Flow

The server implements MCP Authorization:

1. When clients make requests without a Bearer token, the MCP authorization process is initiated
   - The server responds with a 401 and WWW-Authenticate header pointing to the resource metadata
   - The server exposes OAuth resource metadata at `/.well-known/oauth-protected-resource/mcp`
   - The client requests the resource metadata and redirects to Prefactor to obtain the Bearer token
4. Once clients obtain and include a valid Bearer token, requests are processed normally.  Incoming tokens are
   validated with Prefactor using the OAuth token introspection endpoint.

## Environment Variables

The following environment variables are required, add the following structure inside `mise.local.toml`:

```toml
[env]
MCP_AUTH_ISSUER = "<YOUR PREFACTOR MCP ISSUER>"
AUTH_ISSUER = "<YOUR PREFACTOR ISSUER>"
AUTH_CLIENT_ID = "<YOUR PREFACTOR CLIENT ID>"
AUTH_CLIENT_SECRET = "<YOUR PREFACTOR CLIENT SECRET>"
```

## Installation

[Mise](https://mise.jdx.dev) is used to install Node and PNPM, but feel free to install these another way.  If you
are using Mise then the following should work:

```bash
mise install
pnpm install
```

## Building

```bash
pnpm build
```

## Running

```bash
pnpm start
```

## Usage

Once running, the server accepts MCP requests at `http://localhost:3000/mcp`.

Example tools available:
- Call `add` with parameters `a` and `b` to add two numbers
- Call `whoami` to get information about the authenticated user

## License

MIT License - see LICENSE file for details.
