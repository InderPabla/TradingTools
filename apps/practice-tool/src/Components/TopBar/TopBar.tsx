
import * as React from 'react';
import './TobBar.css';

export interface TopBarProps {
    title:string;
    icon:string;
}

export class TopBar extends React.Component<TopBarProps> {

    constructor(props) {
      super(props);
    }

    public render() {
        const { title, icon, children } = this.props;

        return (
            <React.Fragment>
                <div className="tool-toolbar">
                    <div className="tool-title-container">
                        <p> <i className={`fa fa-${icon}`} />{title}</p>
                        {children}
                    </div>
                </div>
            </React.Fragment>
        );
    }
  }
