import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { serverPath } from "./rest";
import { Router } from "@vaadin/router";
import { APIUser, AuthenticatedUser } from "./rest";

@customElement("login-view")
export class LoginView extends LitElement {
  @state()
  user: APIUser = AuthenticatedUser.authenticateFromLocalStorage(() =>
    this._signOut()
  );

  @property()
  path: string = "/login";

  @property({ reflect: true, type: Boolean })
  password: string = "";

  @property({ reflect: true, type: Boolean })
  username: string = "";

  constructor() {
    super();
    this.username = "";
    this.password = "";
  }

  @state()
  loginStatus: number = 0;

  render() {
    return html`
      <div class="login-content">
        <div class="image-display">
          <img src="/images/chef-avatar.png" alt="food" />
        </div>

        <div class="login-form">

          <div class="align">

            <p class= "back" @click = ${()=>Router.go('/app/')}><- Back to Home</p>
            <h1>Log In</h1>

            <form
              @submit=${this.handleSubmit}
              @change=${() => (this.loginStatus = 0)}
            >
              <input
                type="text"
                .value=${this.username}
                @input=${this.handleUsernameChange}
                placeholder="Username"
                required
              />
              <input
                type="password"
                .value=${this.password}
                @input=${this.handlePasswordChange}
                placeholder="Password"
                required
              />
              <button type="submit">Sign In</button>
            </form>

            <p class="fail">
              ${this.loginStatus ? `Login failed: ${this.loginStatus}` : html``}
            </p>

            <div class="register-link">
              <p>Don't have an account?</p>
              <p @click=${() => Router.go("/app/signup")}>Register</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    // Handle form submission here

    // console.log("Username:", this.username);

    fetch(serverPath(this.path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: this.username,
        pwd: this.password,
      }),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          this.loginStatus = res.status;
        }
      })
      .then((json) => {
        if (json) {
          console.log("Authentication:", json.token);
          this.user = AuthenticatedUser.authenticate(json.token, () =>
            this._signOut()
          );

          // Check if there's a redirect parameter in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const redirectRoute = urlParams.get("redirect");

          if (redirectRoute) {
            Router.go(redirectRoute);
          } else {
            window.location.href = "/app/";
          }

          this.requestUpdate();
        }
      });
  }

  handleUsernameChange(event: InputEvent) {
    const inputElement = event.target as HTMLInputElement;
    this.username = inputElement.value;
  }

  handlePasswordChange(event: InputEvent) {
    const inputElement = event.target as HTMLInputElement;
    this.password = inputElement.value;
  }

  _signOut() {
    this.user = APIUser.deauthenticate(this.user);
    document.location.reload();
  }

  static styles = css`
    * {
      font-family: "Raleway", sans-serif;
      padding: 0;
      margin: 0;
      background-color: var(--color-main-bg);
      box-sizing: border-box;
    }

    h1 {
      font-size: 2rem;
    }
    
    .back {
      font-size: 0.8rem;
      color: var(--color-primary);
      cursor: pointer;
    }

    .fail {
      font-size: 0.8rem;

      color: red;
    }

    .login-content {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      display: grid;
      grid-template-columns: 2fr 3fr;
      z-index: 100;
      align-items: stretch;
      height: 100vh;
    }

    form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    form input {
      width: 400px;
      height: 50px;
      padding: 10px;
      border: none;
      background-color: var(--color-login-input-bg);
      border-radius: 10px;
    }

    form button {
      width: 400px;
      height: 50px;
      padding: 10px;
      border: none;
      border-radius: 10px;
      background-color: var(--color-login-button-bg);
      color: white;
    }

    .login-form {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .align {
      height: 100%;
      display: flex;
      gap: 20px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }

    .image-display {
      display: flex;
      justify-content: center;
      align-items: flex-end;
    }

    .image-display img {
      width: 400px;
      height: auto;
      object-fit: cover;
      transform: translateX(100px);
    }

    .register-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .register-link p:last-child {
      font-weight: 500;
    }

    .register-link p:last-child:hover {
      text-decoration: underline;
      cursor: pointer;
    }

    @media (max-width: 988px) {
      .image-display img {
        height: 0;
        display: none;
      }

      .login-content {
        grid-template-columns: 1fr;
      }

      .login-form {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
      }
    }
  `;
}
