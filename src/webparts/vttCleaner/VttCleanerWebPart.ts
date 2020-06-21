import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'VttCleanerWebPartStrings';
import VTTCleaner from './components/VttCleaner';
import { IVTTCleanerProps } from './components/IVTTCleanerProps';
import { DisplayMode } from '@microsoft/sp-core-library';

export interface IVttCleanerWebPartProps {
  description: string;
}

export default class VttCleanerWebPart extends BaseClientSideWebPart <IVttCleanerWebPartProps> {

  public render(): void {
    // We detect whether we're in the workbench or not so that we can display a nice message
    // BUG: The local workbench has a bug that reports its URL is workbencch.aspx.
    const inWorkbench: boolean =
      Environment.type === EnvironmentType.Local
      || this.context.pageContext.site.serverRequestPath.indexOf("/_layouts/15/workbench.aspx")  > -1;
    const element: React.ReactElement<IVTTCleanerProps> = React.createElement(
      VTTCleaner,
      {
        editMode: this.displayMode === DisplayMode.Edit,
        localWorkbench: inWorkbench
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
  //   return {
  //     pages: [
  //       {
  //         header: {
  //           description: strings.PropertyPaneDescription
  //         },
  //         groups: [
  //           {
  //             groupName: strings.BasicGroupName,
  //             groupFields: [
  //               PropertyPaneTextField('description', {
  //                 label: strings.DescriptionFieldLabel
  //               })
  //             ]
  //           }
  //         ]
  //       }
  //     ]
  //   };
  // }
}
