/* ============================================================
   Error Boundary del pannello admin: cattura errori di render
   e mostra un fallback invece di una pagina bianca.
   ============================================================ */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[admin] Errore non gestito:', error, info.componentStack);
  }

  private reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="adm-error-box" role="alert">
          <h2>Qualcosa è andato storto</h2>
          <p>{this.state.error.message}</p>
          <button className="adm-btn" onClick={this.reset} type="button">
            Riprova
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
