<!-- llm-readme-management spec=1 commit=739de778e59ce34da0cc7858746db7e60c3c499e template=default model=qwen3.8-27b-q4 digest=598d66067ca0 generated=2026-09-30T12:35:37Z -->
<a href="https://hauke.cloud" target="_blank"><img src="https://img.shields.io/badge/home-hauke.cloud-brightgreen" alt="hauke.cloud" style="display: block;" /></a>
<a href="https://github.com/hauke-cloud" target="_blank"><img src="https://img.shields.io/badge/github-hauke.cloud-blue" alt="hauke.cloud Github Organisation" style="display: block;" /></a>
<a href="https://github.com/hauke-cloud/llm-readme-management" target="_blank"><img src="https://img.shields.io/badge/template-default-orange" alt="Repository type - default" style="display: block;" /></a>


# Matrix.Hauke.Cloud Transformation


<img src="https://raw.githubusercontent.com/hauke-cloud/.github/main/resources/img/organisation-logo-small.png" alt="hauke.cloud logo" width="109" height="123" align="right">


<llm header>

These are JavaScript transformation scripts for the Hookshot Matrix appservice, paired with a GitHub Actions workflow that provisions them as room state on the hauke.cloud homeserver. The scripts reformat Prometheus Alertmanager webhook payloads into formatted Matrix messages. The repository is for operators who manage alerting rooms on that server.

</llm>


## :book: Description

<llm description>

This repository holds JavaScript transformation scripts for the Hookshot Matrix appservice, together with a GitHub Actions workflow that deploys them into rooms on the hauke.cloud Matrix homeserver. Its purpose is to turn Prometheus Alertmanager webhook payloads into formatted Matrix messages so that operators see alert notifications directly in a Matrix room rather than in a separate dashboard.

The workflow reads a declarative `rooms.yaml` file that maps Matrix rooms to specific transform scripts, resolves room aliases via the directory API, and writes the script content into the room's Hookshot state event through the Matrix Client-Server API. Only the `transformationFunction` field is merged; all other state fields are preserved.

- `scripts/alertmanager.js` — renders FIRING/RESOLVED status, per-alert severity, summary, timestamps, and generator links as an `m.notice` with plain and HTML bodies; adds a room-wide @-mention when any critical alert is firing
- `scripts/test.js` — minimal smoke-test transform that reports the Hookshot API version
- `rooms.yaml` — declarative mapping of rooms to scripts and Hookshot state keys
- `.github/workflows/deploy.yml` — provisioning workflow triggered by pushes to `rooms.yaml`, `scripts/**`, or the workflow file itself

Within the `hauke-cloud` organisation, this repository is the alerting-to-Matrix bridge for the `matrix.hauke.cloud` homeserver.

</llm>


## 🚀 Getting started

<llm getting_started hint="Assume nothing about the ecosystem beyond what the analysis names. If the repository has no build step, say what a reader does with it instead.">

1. Clone the repository.

```bash
git clone https://github.com/hauke-cloud/matrix.hauke.cloud-transformation.git
cd matrix.hauke.cloud-transformation
```

2. In your GitHub repository, create an environment named `matrix.hauke.cloud-transformation` and set the three required secrets: `MATRIX_HOMESERVER` (homeserver base URL), `MATRIX_AS_TOKEN` (Hookshot appservice access token), and `MATRIX_AS_USER_ID` (appservice MXID).

```yaml
# Set in repo Settings → Environments → matrix.hauke.cloud-transformation
MATRIX_HOMESERVER: "https://<your-homeserver>"
MATRIX_AS_TOKEN: "<appservice access token>"
MATRIX_AS_USER_ID: "<appservice MXID>"
```

3. Edit `rooms.yaml` to declare which rooms receive which transformation script.

```yaml
rooms:
  - alias: "#alerting-prod:hauke.cloud"
    connections:
      - state_key: "randy"
        script: "scripts/alertmanager.js"
```

4. Push to `main` to trigger the deploy workflow, which resolves the room alias, merges the script content into the existing Hookshot state event, and writes it back to the homeserver.

```bash
git push origin main
```

After the workflow completes, the transformation script is live in the target room: Alertmanager webhooks hitting that room's Hookshot connection will be rendered as formatted Matrix messages.

</llm>


## :airplane: Usage

<llm usage>

There is no local build or run step. You work with this repository by editing files and pushing to `main`; the GitHub Actions workflow in `.github/workflows/deploy.yml` handles all interaction with the Matrix homeserver.

**Declare rooms and connections in `rooms.yaml`.** Each entry maps a room to one or more Hookshot state keys and the script that backs them. The current production configuration looks like this:

```yaml
rooms:
  - alias: "#alerting-prod:hauke.cloud"
    connections:
      - state_key: randy
        script: scripts/alertmanager.js
```

If you omit `event_type`, the workflow falls back to the repository variable `DEFAULT_EVENT_TYPE` (itself defaulting to `uk.half-shot.matrix-hookshot.generic.hook`). At least one of `alias` or `room_id` is required per room; `alias` is resolved to a room ID via the Matrix directory API at deploy time.

**Write or edit a Hookshot JS transform in `scripts/`.** The scripts run server-side inside the Hookshot appservice (JS transform API v1/v2). `scripts/alertmanager.js` is the production transform: it reads the Alertmanager webhook payload, renders firing/resolved alerts with severity indicators, and returns an `m.notice` event with `plain` and `html` bodies. `scripts/test.js` is a minimal smoke-test transform that posts a one-line confirmation of the API version. There is no local Node execution; you validate by deploying to a room.

**Trigger deployment.** A `git push` to `main` that touches `rooms.yaml`, any file under `scripts/`, or the workflow file itself starts the deploy. You can also run it manually from the GitHub Actions tab via `workflow_dispatch`. The workflow reads the three required secrets (`MATRIX_HOMESERVER`, `MATRIX_AS_TOKEN`, `MATRIX_AS_USER_ID`) from the GitHub environment `matrix.hauke.cloud-transformation`, resolves each room alias, performs a best-effort join, merges only the `transformationFunction` field into the existing Hookshot state event, and PUTs the result back.

</llm>


## 📄 License

This Project is licensed under the GNU General Public License v3.0

- see the [LICENSE](LICENSE) file for details.


## :coffee: Contributing

To become a contributor, please check out the [CONTRIBUTING](CONTRIBUTING.md) file.


## :email: Contact

For any inquiries or support requests, please open an issue in this
repository or contact us at [contact@hauke.cloud](mailto:contact@hauke.cloud).
