import React from 'react';
import ReactDOM from 'react-dom';
import { Flex, Box } from '@rebass/grid';
// import axios from 'axios';
import './index.css';

function TextSpan(text, metadata) {
  this.text = text;
  this.metadata = metadata;
}

function Document(name, textSpans) {
  this.name = name;
  this.textSpans = textSpans;
}
Document.prototype.getFullText = function() {
  return this.textSpans.map(x => x.text).join("");
}
Document.prototype.getNumSpans = function() {
  return this.textSpans.length;
}
Document.prototype.getTextSpan = function(i) {
  return this.textSpans[i];
}

class DocumentBox extends React.Component {
  identifySpanTypeClass(textSpan) {
    let cssClass;
    if (textSpan.metadata !== null) {
      cssClass = "namedEntity";
    } else {
      cssClass = "";
    }
    return cssClass;
  }

  identifySelectionClass(textSpan) {
    let cssClass;
    if (textSpan.selected) {
      cssClass = "selectedSpan";
    } else {
      cssClass = "";
    }
    return cssClass;
  }

  render() {
    var renderedSpans = [];
    for (let i = 0; i < this.props.textSpans.length; i++) {
      let curText = this.props.textSpans[i];

      let cssClass = (
        this.identifySpanTypeClass(curText) +
        " " +
        this.identifySelectionClass(curText)
      );
      renderedSpans.push(
        <span
          className={cssClass}
          key={"text-span-" + i}
          onClick={() => curText.onClick()}
        >
          {curText.text}
        </span>
      );
    }

    return <div>{renderedSpans}</div>
  }
}

class MetadataBox extends React.Component {
  formatMetadata(metadata) {
    return metadata.description;
  }

  render() {
    let content = this.formatMetadata(this.props.metadata);

    let button;
    if (content) {
      button = <button onClick={() => this.props.selectOnClick()}>Select</button>;
    } else {
      button = null;
    }

    return (
      <div>
        {button}
        <div>{content}</div>
      </div>
    )
  }
}

class DocumentViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeMetadata: {},
      activeTextSpanIndex: null,
    };
  }

  updateActiveMetadataAndSelectTextSpan(textSpan, i) {
    this.setState({
      activeMetadata: textSpan.metadata,
      activeTextSpanIndex: i,
    });
  }

  selectTextSpan() {
    let curTextSpan = this.props.document.getTextSpan(this.state.activeTextSpanIndex);

    if (curTextSpan.selected) {
       curTextSpan.selected = false;
    } else {
       curTextSpan.selected = true;
    }

    this.forceUpdate();
    console.log(this.getSelected());
  }

  getSelected() {
    let selectedIndices = [];
    for (let i = 0; i < this.props.document.getNumSpans(); i++) {
      let curTextSpan = this.props.document.getTextSpan(i);
      if (curTextSpan.selected) {
        selectedIndices.push(curTextSpan.text);
      }
    }
    return selectedIndices;
  }

  render() {
    for (let i = 0; i < this.props.document.getNumSpans(); i++) {
      let curTextSpan = this.props.document.getTextSpan(i);

      let onClickFunc;
      if (curTextSpan.metadata !== null) {
        onClickFunc = () => this.updateActiveMetadataAndSelectTextSpan(curTextSpan, i)
      } else {
        onClickFunc = () => null;
      }
      curTextSpan.onClick = onClickFunc;
    }

    return (
      <Flex flexDirection="row">
        <Flex flexDirection="column">
          <Box p={10} className="documentBox">
            <DocumentBox textSpans={this.props.document.textSpans}/>
          </Box>
          <Box p={10} className="metadataBox">
            <MetadataBox
              metadata={this.state.activeMetadata}
              selectOnClick={() => this.selectTextSpan()}
            />
          </Box>
        </Flex>
        <Box>
          {this.getSelected().length ? "You have chosen " + this.getSelected().join(" and "): ""}
        </Box>
      </Flex>
    );
  }
}

function getStaticDummyDocument() {
  const dummyTextSpans = [
    new TextSpan("Hello, ", null),
    new TextSpan("Apple Inc", {"uuid": "1398j-dg244", "description": "A company that sells stuff"}),
    new TextSpan(" will see you now. ", null),
    new TextSpan("Google", {"uuid": "sss", "description": "A company that searches"}),
    new TextSpan(" will be here shortly.", null),
  ];
  return new Document("dummy01", dummyTextSpans)
}

class DocumentList extends React.Component {
  render() {
    let listItems = [];
    for (let i = 0; i < this.props.documents.length; i++) {
      let curDocument = this.props.documents[i];
      listItems.push(
        <li
          key={"li-" + i}
          onClick={() => this.props.activateDocument(curDocument)}
        >
          {curDocument.name}
        </li>
      );
    }

    return <ul>{listItems}</ul>
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeDocument: new Document("", []),
    };
  }

  render() {
    return (
      <Flex>
        <Box>
          <DocumentList
            documents={this.props.documents}
            activateDocument={(document) => this.setState({activeDocument: document})}
          />
        </Box>
        <Box>
          <DocumentViewer document={this.state.activeDocument} />
        </Box>
      </Flex>
    )
  }
}

ReactDOM.render(
  // <DocumentViewer document={getStaticDummyDocument()} />,
  <App documents={[getStaticDummyDocument()]} />,
   document.getElementById('root')
);
