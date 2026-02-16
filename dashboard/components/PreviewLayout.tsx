
import React from 'react';
import ChatBox from './ChatBox';
import MobilePreview from './MobilePreview';
import { MobileControls, DesktopBuildButton } from './DashboardControls';
import { AppMode, ProjectConfig } from '../../types';

interface PreviewLayoutProps {
  props: any;
}

const PreviewLayout: React.FC<PreviewLayoutProps> = ({ props }) => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-[#09090b]">
      <div className="flex-1 flex flex-col lg:flex-row h-full">
        <ChatBox 
          messages={props.messages} input={props.input} setInput={props.setInput} 
          isGenerating={props.isGenerating} handleSend={props.handleSend} mobileTab={props.mobileTab} 
          selectedImage={props.selectedImage} setSelectedImage={props.setSelectedImage}
          handleImageSelect={props.handleImageSelect}
        />
        <MobilePreview 
          projectFiles={props.previewOverride || props.projectFiles} 
          setMode={props.setMode} 
          handleBuildAPK={props.handleBuildAPK} mobileTab={props.mobileTab}
          isGenerating={props.isGenerating}
          projectConfig={props.projectConfig}
          projectId={props.projectId}
          runtimeError={props.runtimeError}
          onAutoFix={props.handleAutoFix}
        />
      </div>
      <MobileControls 
        mobileTab={props.mobileTab} 
        setMobileTab={props.setMobileTab} 
        handleBuildAPK={props.handleBuildAPK} 
      />
      <DesktopBuildButton onClick={props.handleBuildAPK} />
    </div>
  );
};

export default PreviewLayout;
