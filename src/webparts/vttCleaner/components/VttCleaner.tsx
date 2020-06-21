import * as React from 'react';
import styles from './VTTCleaner.module.scss';
import { IVTTCleanerProps } from './IVTTCleanerProps';
import ReactFileReader from 'react-file-reader';
import { IVTTCleanerState } from './IVTTCleanerState';

import { CSVLink } from "react-csv";

import * as strings from 'VttCleanerWebPartStrings';
import { IVTTRow } from './IVTTRow';

import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";

import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';

import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from 'office-ui-fabric-react/lib/DetailsList';

export default class VTTCleaner extends React.Component<IVTTCleanerProps, IVTTCleanerState> {
  private csvLink: CSVLink;
  private openButton: HTMLButtonElement;

  private columns: IColumn[] = [
    {
      key: 'column1',
      name: strings.TimeColumnTitle,
      fieldName: 'time',
      minWidth: 40,
      maxWidth: 60,
      onRender: (item: IVTTRow) => {
        return item.time;
      }
    },
    {
      key: 'column2',
      name: strings.TextColumnTitle,
      fieldName: 'text',
      minWidth: 210,
      maxWidth: 350,
      onRender: (item: IVTTRow) => {
        return item.text;
      }
    }];

  constructor(props: IVTTCleanerProps) {
    super(props);
    this.state = ({
      dataToDownload: [],
      readyToExport: false
    });
  }
  public render(): React.ReactElement<IVTTCleanerProps> {
    const headers = [
      { label: strings.TextColumnTitle, key: "text" },
      { label: strings.TimeColumnTitle, key: "time" }
    ];

    const commandItems: ICommandBarItemProps[] = [
      {
        key: 'open',
        text: strings.OpenCommandLabel,
        title: strings.OpenCommandTitle,
        iconProps: { iconName: 'OpenFile' },
        onClick: () => this.openButton.click()
      },
      {
        key: 'export',
        text: strings.ExportCommandLabel,
        title: strings.ExportCommandTitle,
        iconProps: { iconName: 'Export' },
        onClick: () => this.csvLink && this.csvLink.link.click(),
        disabled: this.state && !this.state.readyToExport
      },
    ];
    return (
      <div className={styles.vttCleaner}>
        <CommandBar
          items={commandItems}
          ariaLabel={strings.CommandBarAriaLabel}
        />
        {this.state.dataToDownload && this.state.dataToDownload.length > 0 &&
          <>
            <DetailsList
              items={this.state.dataToDownload}
              compact={true}
              columns={this.columns}
              selectionMode={SelectionMode.none}
              layoutMode={DetailsListLayoutMode.justified}
              isHeaderVisible={true}
            />
            <CSVLink data={this.state.dataToDownload}
              headers={headers}
              style={{ display: 'none' }}
              ref={(r) => this.csvLink = r}
              filename={this.state.exportFileName}
              target="_blank"

            >Export CSV</CSVLink>
          </>
        }
        {this.state.dataToDownload && this.state.dataToDownload.length === 0 &&
          <Placeholder iconName='OpenFile'
            contentClassName={styles.placeholder}
            iconText={strings.PlaceholderIconText}
            description={strings.PlaceholderDescription}
            buttonLabel={strings.PlaceholderButtonLabel}
            onConfigure={() => this.openButton.click()}
          />
        }

        <ReactFileReader
          handleFiles={this.handleFiles}
          fileTypes={[".vtt"]}
          multipleFiles={false}
        >
          <button style={{ display: 'none' }} ref={(elm) => this.openButton = elm}>Upload</button>
        </ReactFileReader>
      </div>
    );
  }

  private handleFiles = (filesList: FileList) => {
    const file: File = filesList[0];

    this.setState({
      file
    }, () => {
      var reader = new FileReader();

      reader.onload = (_e) => {
        const text: string = reader.result as string;

        // Split by line and remove empty lines
        const segments: string[] = text.split('\n');
        const cleanedSegments: string[] = segments.map((segment: string) => {
          return this.cleanSegment(segment);
        });

        const out: IVTTRow[] = [];
        let lastTimeStamp: string = undefined;
        let lastText: string = undefined;
        segments.forEach((segment: string) => {
          //Is is a timestamp
          const timestampMatch: RegExpMatchArray = segment.match(/\d{2}:\d{2}:\d{2}.\d{3}\s-->\s\d{2}:\d{2}:\d{2}.\d{3}/);
          const isTimeStamp: boolean = timestampMatch && timestampMatch.length > 0;

          if (isTimeStamp) {
            if (lastTimeStamp !== undefined) {
              // Commit the row
              const newRow: IVTTRow = {
                text: lastText.trim(),
                time: lastTimeStamp
              };
              out.push(newRow);
              lastText = "";
              lastTimeStamp = "";
            }
            lastTimeStamp = segment.replace(/\.\d\d\d --> \d\d:\d\d:\d\d\.\d\d\d/, '');
            console.log("Timestamp", lastTimeStamp);
          } else {
            segment = segment
              .replace("WEBVTT", '')
              .replace('align:start position:0%', '')
              .replace(/NOTE\s*Confidence:\s*\d.\d*/, '')
              .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/, '')
              .replace(/NOTE\sduration:"\d\d:\d\d:\d\d.\d*"/, '')
              .replace(/NOTE\slanguage:.{2}-.{2}/, '');

            if (segment.length > 0) {
              if (lastText === undefined) {
                lastText = segment;
              } else {
                lastText = lastText + " " + segment;
              }
            }
          }
        });

        if (lastText != "" && lastTimeStamp != "") {
          const newRow: IVTTRow = {
            text: lastText.trim(),
            time: lastTimeStamp
          };
          out.push(newRow);
        }

        this.setState({
          dataToDownload: out,
          readyToExport: true
        });
      };

      reader.readAsText(file);
    });
  }

  private cleanSegment(segment: string): string {
    //replace(/<.*?\>/, '').replace(/.+\d+/, '').
    return segment
      .replace("WEBVTT", '')
      .replace('align:start position:0%', '')
      .replace(/\.\d\d\d --> \d\d:\d\d:\d\d\.\d\d\d/, '')
      .replace(/NOTE\s*Confidence:\s*\d.\d*/, '')
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/, '')
      .replace(/NOTE\sduration:"\d\d:\d\d:\d\d.\d*"/, '')
      .replace(/NOTE\slanguage:.{2}-.{2}/, '');
  }


  /**
   * Gets called when an error has occurred uploading a file
   */
  private handleErrors = (errors: any) => {
    console.log("Handle errors", errors);
    this.setState({
      errors
    });
  }

  /**
   * Resets the editor by removing all files and errors
   */
  private resetFiles = () => {
    this.setState({
      file: undefined,
      errors: []
    });
  }

  private download = (_event) => {
    const inFileName: string = this.state.file.name;
    const outFileName: string = inFileName.substr(0, inFileName.lastIndexOf('.')) + ".csv";

    this.setState({
      exportFileName: outFileName
    }, () => {
      // click the CSVLink component to trigger the CSV download
      this.csvLink.link.click();
    });
  }
}
