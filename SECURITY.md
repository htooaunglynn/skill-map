# Security Policy

## Supported Versions

SkillMap is currently in early MVP development. Security fixes are handled on the main branch until versioned releases are introduced.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Releases | Not yet published |

## Reporting a Vulnerability

Please do not open a public issue for security vulnerabilities.

Use GitHub private vulnerability reporting if it is enabled for this repository. If private reporting is not available, contact the maintainer privately through GitHub before sharing exploit details.

Please include:

- A clear description of the issue.
- Steps to reproduce.
- Impact and affected browser/runtime, if known.
- Any suggested fix or mitigation.

## Project Security Model

SkillMap is a local-first browser app. The MVP does not use a backend server, database, authentication, OAuth, or cloud provider API.

Important security-sensitive areas include:

- Local JSON file parsing and validation.
- File System Access API read/write behavior.
- IndexedDB autosave and saved file handles.
- LocalStorage device identity.
- Markdown rendering and user-entered content.

## Disclosure

The maintainer will review valid reports as soon as practical, prioritize fixes by impact, and coordinate public disclosure after a fix or mitigation is available.

