//
//  Copyright (c) 2017 Ricoh Company, Ltd. All Rights Reserved.
//  See LICENSE for more information.
//

import React from 'react';
import {FormGroup, Col, Button} from 'react-bootstrap';
import * as I18N from '../components/i18n';

import RadioButtons from '../components/RadioButtons';
import MinMaxSlider from '../components/MinMaxSlider';
import ReadonlyText from '../components/ReadonlyText';
import RGBGain from '../components/RGBGain';
import ExposureBiasCompensation from '../components/ExposureBiasCompensation';
import ResetToDefault from './ResetToDefault';
import MtpActionCreator from '../data/MtpActionCreator';
import Notify from '../components/Notify';


const _VideoOutputImages = {
        img_0: { src: './assets/images/icon_FullHD.png',   alt: 'full' },
        img_1: { src: './assets/images/icon_actualsize.png', alt: 'actual' }
      };


function HR(props) {
  const d = (props.show)? {}: {display: 'none'};
  return (<hr style={d}/>);
}

function Icon(props) {
  const d = (props.show)? {}: {display: 'none'};
  return (<div className={'group-icon ' + props.icon} style={d}/>);
}


function getDesc(immMap, propName) {
  if (!immMap[propName]) {
    return {};
  }
  return immMap[propName].toObject();
}

export default class Properties extends React.Component {
  onResetToDefault() {
    this.refs.resetToDefaultModal.show();
  }

  onPropChanged(value, propName) {
    (new MtpActionCreator()).setPropValue(propName, value).then(result=>{
      switch (result.status) {
      case 'OK':
        Notify.showSuccess('propertyUpdated', propName);
        break;
      case 'FAILED(2019)':
        Notify.show(result.status, 'failedWhileRecording', {i18n_prefix:'notify'});
        reloadValue();
        break;
      default:
        Notify.showDanger('propertyUpdateFailed', propName);
      }
    });
  }

  render() {
    const current = this.props.appStore.get('current');
    var propValues = {},
        showItems = false;
    if (current.deviceId) {
      if (current.propValues) {
        propValues = current.propValues.toObject();
        showItems = true;
      } else {
        (new MtpActionCreator()).loadProperties();
      }
    }
    const WhiteBalance_Auto = 2,
          StitchMode_Auto = 1,
          muteRGBGain = (getDesc(propValues, 'WhiteBalance').current === WhiteBalance_Auto),
          enableStitchModeButton = (getDesc(propValues, 'StitchMode').current === StitchMode_Auto),
          mute = this.props.appStore.get('mute');
    console.debug('Properties', {muteRGBGain, enableStitchModeButton, mute});
    return (
      <div id='settingItems' className='settings-body'>
        <Icon show={showItems} icon='icon-image'/>
        <ReadonlyText propName='StillCaptureMode' propDesc={propValues.StillCaptureMode}>
          <I18N.Button bsStyle='primary' className='btn-right-alignment' data-i18n='label.initializeProps' onClick={this.onResetToDefault.bind(this)}/>
        </ReadonlyText>
        <RadioButtons propName='WhiteBalance' propDesc={propValues.WhiteBalance} onChange={this.onPropChanged.bind(this)}/>
        <RGBGain propName='RGBGain' propDesc={propValues.RGBGain} mute={muteRGBGain || mute} onChange={this.onPropChanged.bind(this)}/>
        <ExposureBiasCompensation propName='ExposureBiasCompensation' propDesc={propValues.ExposureBiasCompensation} mute={mute} onChange={this.onPropChanged.bind(this)}/>
        <RadioButtons propName='ZenithMode' propDesc={propValues.ZenithMode} onChange={this.onPropChanged.bind(this)}/>
        <RadioButtons propName='VideoOutput' propDesc={propValues.VideoOutput} {..._VideoOutputImages} onChange={this.onPropChanged.bind(this)}/>
        <RadioButtons propName='WDR' propDesc={propValues.WDR} onChange={this.onPropChanged.bind(this)}/>
        <RadioButtons propName='StitchMode' propDesc={propValues.StitchMode} onChange={this.onPropChanged.bind(this)}>
          <I18N.Button bsStyle='default' data-i18n='label.retryDetect' disabled={!enableStitchModeButton} onClick={()=>this.onPropChanged(StitchMode_Auto, 'StitchMode')}/>
        </RadioButtons>
        <RadioButtons propName='VideoBitrate' propDesc={propValues.VideoBitrate} onChange={this.onPropChanged.bind(this)}/>
        <HR show={showItems}/>
        <Icon show={showItems} icon='icon-volume'/>
        <RadioButtons propName='AudioOutput' propDesc={propValues.AudioOutput} onChange={this.onPropChanged.bind(this)}/>
        <MinMaxSlider propName='AudioInputGain' propDesc={propValues.AudioInputGain} mute={mute} onChange={this.onPropChanged.bind(this)}/>
        <HR show={showItems}/>
        <Icon show={showItems} icon='icon-led'/>
        <MinMaxSlider propName='StandbyLedBrightness' propDesc={propValues.StandbyLedBrightness} mute={mute} onChange={this.onPropChanged.bind(this)}/>
        <MinMaxSlider propName='TransmittingLedBrightness' propDesc={propValues.TransmittingLedBrightness} mute={mute} onChange={this.onPropChanged.bind(this)}/>
        <ResetToDefault ref='resetToDefaultModal' {...this.props}/>
      </div>
    );
  }
}
