
import React from 'react';
import CodeEditor from './CodeEditor';
import BuildStatusDisplay from './BuildStatusDisplay';
import { AppMode } from '../../types';

interface EditorLayoutProps {
  props: any;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({ props }) => {
  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-500 bg-[#09090b]">
      {props.buildStatus.status === 'idle' ? (
        <div className="flex-1 flex overflow-hidden">
          <CodeEditor 
            projectFiles={props.projectFiles} setProjectFiles={props.setProjectFiles} 
            selectedFile={props.selectedFile} setSelectedFile={props.setSelectedFile} 
            handleBuildAPK={props.handleBuildAPK} 
            onOpenConfig={() => props.setMode(AppMode.CONFIG)}
          />
        </div>
      ) : (
        <BuildStatusDisplay 
          status={props.buildStatus.status} 
          message={props.buildStatus.message}
          apkUrl={props.buildStatus.apkUrl} 
          webUrl={props.buildStatus.webUrl}
          buildSteps={props.buildSteps}
          handleSecureDownload={props.handleSecureDownload}
          resetBuild={() => props.setBuildStatus({ status: 'idle', message: '' })}
        />
      )}
    </div>
  );
};

export default EditorLayout;
