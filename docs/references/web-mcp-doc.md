# MCP-B

Browser-based Model Context Protocol (MCP) implementation that enables AI assistants to interact with web applications through standardized MCP tools.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/daohopfhkdelnpemnhlekblhnikhdhfa?style=flat-square&label=Chrome%20Extension)](https://chromewebstore.google.com/detail/mcp-b/daohopfhkdelnpemnhlekblhnikhdhfa)
[![npm version](https://img.shields.io/npm/v/@mcp-b/transports?style=flat-square)](https://www.npmjs.com/package/@mcp-b/transports)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/MiguelsPizza/WebMCP/ci.yml?style=flat-square)](https://github.com/MiguelsPizza/WebMCP/actions)
[![GitHub stars](https://img.shields.io/github/stars/MiguelsPizza/WebMCP?style=flat-square)](https://github.com/MiguelsPizza/WebMCP/stargazers)

[Quick Start](#quick-start) • [Demo](#demo) • [Installation](#installation) • [Documentation](https://mcp-b.ai) • [Contributing](#contributing)

## What is MCP-B?

![](./FullArch.png)

MCP-B runs Model Context Protocol servers directly inside web pages, solving a critical gap where most white-collar work happens in browsers, yet MCP's standard solution bypasses browsers entirely. Instead of building complex OAuth flows or managing API keys, MCP-B leverages the browser's existing authentication and security model.

## The Problem

Current MCP implementations require developers to:

- Run servers locally with environment variables for API keys
- Implement complex OAuth 2.1 flows for remote servers
- Rebuild authentication layers that already exist in web applications
- Manage separate infrastructure for AI tool integration

For users, this means configuration files, API key management, and technical setup that creates insurmountable barriers for non-developers.

## The Solution

MCP-B embeds MCP servers directly into web applications,