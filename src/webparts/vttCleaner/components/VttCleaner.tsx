import * as React from 'react';
import styles from './VttCleaner.module.scss';
import { IVTTCleanerProps } from './IVttCleanerProps';
import Files from "react-butterfiles";
import { IVTTCleanerState } from './IVTTCleanerState';

export default class VTTCleaner extends React.Component<IVTTCleanerProps, IVTTCleanerState> {
  private fileBrowser: HTMLDivElement = undefined;
  /**
   *
   */
  constructor(props: IVTTCleanerProps) {
    super(props);
    this.state = ({ files: [] });
  }
  public render(): React.ReactElement<IVTTCleanerProps> {
    return (
      <div className={ styles.vttCleaner }>
         <Files
          onSuccess={this.handleSuccess}
          onError={this.handleErrors}
        >
          {({ browseFiles, getDropZoneProps }) => (
            <>
              {this.state.files !== undefined && this.state.files.length > 0 ? (
                <div
                  {...getDropZoneProps({
                    className: styles.dropZone
                  })}>

                  <div ref={(elm) => this.fileBrowser = elm}
                    onClick={browseFiles}
                    {...getDropZoneProps({
                      className: styles.hiddenDropZone
                    })}
                  />
                </div>
              ) : (
                  <div
                    ref={(elm) => this.fileBrowser = elm}
                    onClick={browseFiles}
                    {...getDropZoneProps({
                      className: styles.dropZone
                    })}
                  >
                    {/* <div className={styles.placeholderDescription}>
                      <span className={styles.placeholderDescriptionText}>{this.props.instructions}</span>
                    </div> */}
                  </div>
                )}
            </>
          )}
        </Files>
      </div>
    );
  }

  /**
   * Gets called when a file has been successfully uploaded
   */
  private handleSuccess = (files: any) => {
    console.log("Files", files);
    this.setState({
      files: files,
      errors: []
    });
  }

  /**
   * Gets called when an error has occurred uploading a file
   */
  private handleErrors = (errors: any) => {
    console.log("Handle errors", errors);
    this.setState({
      files: [],
      errors
    });
  }

  /**
   * Resets the editor by removing all files and errors
   */
  private resetFiles = () => {
    this.setState({
      files: [],
      errors: []
    });
  }

}
