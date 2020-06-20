import * as React from 'react';
import styles from './VttCleaner.module.scss';
import { IVTTCleanerProps } from './IVttCleanerProps';
import Files from "react-butterfiles";
import { IVTTCleanerState } from './IVTTCleanerState';

// Used for messages
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';

import { CSVLink } from "react-csv";


import * as strings from 'VttCleanerWebPartStrings';


export default class VTTCleaner extends React.Component<IVTTCleanerProps, IVTTCleanerState> {
  private fileBrowser: HTMLDivElement = undefined;
  private csvLink: CSVLink;
  /**
   *
   */
  constructor(props: IVTTCleanerProps) {
    super(props);
    this.state = ({ files: [],
    dataToDownload: [] });
  }
  public render(): React.ReactElement<IVTTCleanerProps> {
    return (
      <div className={ styles.vttCleaner }>
       <CSVLink data={this.state.dataToDownload}
        ref={(r) => this.csvLink = r}
        filename={"my-file.csv"}
        target="_blank"
       >Download me</CSVLink>
{this.props.editMode &&
  <MessageBar
            messageBarType={MessageBarType.warning}
            isMultiline={true}
            truncated={false}
          >
            { strings.EditModeWarning }<br/>
            { this.props.localWorkbench ? strings.EditModeLocalWorkbenchWarning : strings.EditModeSharePointWarning }
          </MessageBar>
}


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

  private download = (_event) => {
    // const currentRecords = this.reactTable.getResolvedState().sortedData;
    const data_to_download = [
      { firstname: "Ahmed", lastname: "Tomi", email: "ah@smthing.co.com" },
      { firstname: "Raed", lastname: "Labes", email: "rl@smthing.co.com" },
      { firstname: "Yezzi", lastname: "Min l3b", email: "ymin@cocococo.com" }
    ];
    // for (var index = 0; index < currentRecords.length; index++) {
    //    let record_to_download = {}
    //    for(var colIndex = 0; colIndex < columns.length ; colIndex ++) {
    //       record_to_download[columns[colIndex].Header] = currentRecords[index][columns[colIndex].accessor]
    //    }
    //    data_to_download.push(record_to_download)
    // }
    this.setState({ dataToDownload: data_to_download }, () => {
       // click the CSVLink component to trigger the CSV download
       this.csvLink.link.click()
    });
  }


}
