import React, { PureComponent, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  BackHandler
} from 'react-native';

import {Spinner} from 'native-base'

import Requests from './Requests';

const BASE_URL = 'http://api.giphy.com/v1/gifs/';

class GifSearch extends PureComponent {

	constructor(props) {
      super(props);
      
      this.state = {
        gifs: [],
        offset: 0,
        term: "",
        visible: this.props.visible != null ? this.props.visible : true,
        scrollOffset: 0,
        fetching: false,
        gifsOver: false,
      }

      this.gifsToLoad = 15;
      if (props.gifsToLoad != null) {
          this.gifsToLoad = props.gifsToLoad;
      }
      this.maxGifsToLoad = 60;
      if (props.maxGifsToLoad != null) {
          this.maxGifsToLoad = props.maxGifsToLoad;
      }
      this.placeholderTextColor = 'grey';
      if (props.placeholderTextColor != null) {
          this.placeholderTextColor = props.placeholderTextColor;
      }
      this.giphyApiKey = '';
      if (props.giphyApiKey != null) {
          this.giphyApiKey = props.giphyApiKey;
      }
      this.darkGiphyLogo = false;
      if (props.darkGiphyLogo != null) {
          this.darkGiphyLogo = props.darkGiphyLogo;
      }
      this.developmentMode = true;
      if (props.developmentMode != null) {
          this.developmentMode = props.developmentMode;
      }
      this.loadingSpinnerColor = 'white';
      if (props.loadingSpinnerColor != null) {
          this.loadingSpinnerColor = props.loadingSpinnerColor;
      }
      this.showScrollBar = true;
      if (props.showScrollBar != null) {
          this.showScrollBar = props.showScrollBar;
      }
      this.placeholderText = "Search GIF";
      if (props.placeholderText != null) {
          this.placeholderText = props.placeholderText;
      }
      this.horizontal = true;
      if (props.horizontal != null) {
          this.horizontal = props.horizontal;
      }
      

  }

  fetchGifs = () => {
      if (this.state.fetching){
        return
      }
      this.setState({fetching: true, gifsOver: false})
      if (this.state.term == ""){
          this.fetchTrendingGifs()
          return
      }
      this.fetchGifsByTerm()
  }

  fetchGifsByTerm = () => {
      Requests.fetch("GET", BASE_URL + "search", {
          "api_key": this.giphyApiKey,
          "q": this.state.term,
          "limit": Math.min(this.gifsToLoad, this.maxGifsToLoad - this.state.offset),
          "offset": this.state.offset
      }). then((responseJSON) => {
          if (responseJSON.data.length > 0){
              let responseUnique = responseJSON.data.filter((obj1, index1) => {return !responseJSON.data.some((obj2, index2) => obj1.id === obj2.id && index1 != index2)}); // remove duplicates
              let newGifsUnique = responseUnique.filter(o1 => {return !this.state.gifs.some(o2 => o1.id === o2.id)}); // remove duplicates with previous gifs
              this.setState({ gifs: [...this.state.gifs, ...newGifsUnique],
                              offset: this.state.offset + this.gifsToLoad,
                              fetching: false})
          } else {
              this.setState({fetching: false, gifsOver: true})
          }
      }).catch((error) => {
        this.setState({fetching: false, gifsOver: true})
        if (this.props.onError) {
            this.props.onError(error)
        }
    })     
  }

  fetchTrendingGifs = () => {
      Requests.fetch("GET", BASE_URL + "trending", {
          "api_key": this.giphyApiKey,
          "limit": Math.min(this.gifsToLoad, this.maxGifsToLoad - this.state.offset),
          "offset": this.state.offset
      }). then((responseJSON) => {
          if (responseJSON.data.length > 0){
              let responseUnique = responseJSON.data.filter((obj1, index1) => {return !responseJSON.data.some((obj2, index2) => obj1.id === obj2.id && index1 != index2)}); // remove duplicates
              let newGifsUnique = responseUnique.filter(o1 => {return !this.state.gifs.some(o2 => o1.id === o2.id)}); // remove duplicates with previous gifs
              this.setState({ gifs: [...this.state.gifs, ...newGifsUnique],
                              offset: this.state.offset + this.gifsToLoad,
                              fetching: false})
          } else {
              this.setState({fetching: false, gifsOver: true})
          }       
      }).catch((error) => {
          this.setState({fetching: false, gifsOver: true})
          if (this.props.onError) {
              this.props.onError(error)
          }
      })
  }

  onSearchTermChanged = (new_term) => {
      this.setState({term: new_term, offset: 0, gifs: []}, () => {
          this.fetchGifs()
      })
  }

  loadMoreGifs = () => {
      if (this.state.offset < this.maxGifsToLoad && !this.state.gifsOver) {
          this.fetchGifs()
      }
  }

  handleBackButtonClick = () => {
      var wasVisible = this.props.visible;
      this.props.onBackPressed()
      return wasVisible
  }

  componentDidMount() {
      this.fetchGifs()
      if (this.props.onBackPressed != null){
          BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
      }
  }
  
  componentWillUnmount() {
      if (this.props.onBackPressed != null){
          BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
      }
  }

  render() {
    return (
      this.props.visible == null || this.props.visible ?
      (
        <View style={[this.styles.view, this.props.style]}>

          <View style={{flexDirection: 'row', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
            <TextInput
              placeholder={this.placeholderText}
              placeholderTextColor={this.placeholderTextColor}
              autoCapitalize='none'
              style={[this.styles.textInput, {width: this.developmentMode ? '100%' : '60%'}, this.props.textInputStyle]}
              onChangeText={this.onSearchTermChanged}
            />
            {!this.developmentMode ?
            (
                <Image 
                  source={this.darkGiphyLogo ? (require('../img/PoweredBy_200px-White_HorizText.png')) : (require('../img/PoweredBy_200px-Black_HorizText.png'))} 
                  style={{width: '40%', height: 50, resizeMode: 'contain'}}
                />
            )
            :
            (null)
            }
          </View>
          <FlatList
            onEndReached={this.loadMoreGifs}
            onEndReachedThreshold={0.95}
            onScroll={this.handleScroll}
            style={[this.styles.gifList, this.props.gifListStyle]}
            contentContainerStyle={{alignItems: 'center'}}
            data={this.state.gifs}
            horizontal={this.horizontal}
            showsHorizontalScrollIndicator={this.showScrollBar}
            showsVerticalScrollIndicator={this.showScrollBar}
            renderItem={({item}) => {
              var aspectRatio = null;
              if (parseInt(item.images.preview_gif.height)) {
                  aspectRatio = parseInt(item.images.preview_gif.width)/parseInt(item.images.preview_gif.height)
              }
              return (
                <TouchableOpacity activeOpacity={0.7} onPress={() => {this.props.onGifSelected(item.images.fixed_width_downsampled.url)}}>
                  <Image
                    resizeMode='contain'
                    style={[this.styles.image, {aspectRatio: aspectRatio}, this.horizontal ? {marginRight: 20} : {marginBottom: 20}, this.props.gifStyle]}
                    source={{uri: item.images.preview_gif.url}}
                  />
                </TouchableOpacity>
              )
            }}
            ListFooterComponent={(
              this.state.offset < this.maxGifsToLoad && !this.state.gifsOver?
              (
                <View style={{flex: 1, justifyContent: "center", alignItems: "center", width: 150}}>
                    <Spinner size="large" color={this.loadingSpinnerColor} />
                </View>
              )
              :
              (null)
            )}
          />
        </View>
      )
      :
      (null)
    );
  }


  styles = StyleSheet.create({
    view: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: 'black',
      padding: 10
    },
    textInput: {
      height: 50,
      fontSize: 20,
      paddingLeft: 10,
      marginBottom: 10,
      color: 'white'
    },
    image: {
      height:150,
      borderWidth: 3,
    },
    gifList: {
      height: 130,
      margin: 5,
      paddingBottom: 20,
    },
  });

}

export default GifSearch;
