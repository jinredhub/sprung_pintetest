import React, { Component } from 'react';
import './FollowingPins.css';
import firebase from 'firebase';
import axios from '../../axios';
// import {database} from "../../firebase";

import Navbar from '../../components/Navbar/Navbar';
import Button from '../../components/Button/Button';
import Pin from "../../components/Pin/Pin";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

class FollowingPins extends Component {
    state={
        loadingIcon: false
    }

    componentDidMount(){
        document.addEventListener('mousedown', this.handleOutsideClick);

        console.log('component did mount');
        firebase.auth().onAuthStateChanged(firebaseUser =>{
            if(firebaseUser){
                this.setState({ 
                    loginEmail: firebaseUser.email,
                });

                const user = firebase.auth().currentUser;
                // console.log('current user: ', user);
                this.loadDatabase();
            }
            else{
                const url = '/';
                window.location.href = url;
                console.log('not logged in');
            }
        });
    }

    componentWillUnmount(){
        document.removeEventListener('mousedown', this.handleOutsideClick);
    } 

    toggleMobileNavbar = () =>{
        this.setState({
            showMobileNavbar: !this.state.showMobileNavbar
        });
    }

    handleOutsideClick = (e) =>{
        // clicked h1?
        if(this.navbarNode.contains(e.target)){
            
        }
        else{
            this.setState({
                showMobileNavbar: false
            });
        }
    }

    loadDatabase = () =>{
        this.setState({
            loadingIcon: true
        });

        axios.get('/.json')
            .then(res=>{
                console.log('load: ',res.data);

                // firebase won't store empty array, so create empty array here
                for(let user of res.data.allUsers){
                    if(!user.yourPins){
                        user.yourPins = [];
                    }
                    if(!user.followingPins){
                        user.followingPins = [];
                    }
                }
                console.log('new res.data: ', res.data);
                this.setState({
                    allUsers: res.data.allUsers,
                    dbLoaded: true,
                    lastPinId: res.data.lastPinId,
                });
                this.setStateFollowingPins();
            })
            .catch(err=>console.log(err));
    };

    logOutHandler = () =>{
        console.log('logging out');
        firebase.auth().signOut();
    }

    setStateFollowingPins = () =>{
        const allUsers = [...this.state.allUsers];
        const loginEmail = this.state.loginEmail;
        console.log('loginemail: ', loginEmail);
        console.log('allusers: ', allUsers);
        const userIndex = allUsers.findIndex(val=>{
            return val.email === loginEmail;
        });
        const followingPins = allUsers[userIndex].followingPins;
        console.log('floowing pins: ', followingPins);
        this.setState({
            followingPins: followingPins,
            loadingIcon: false
        });
    }

    // pin handlers-------------------------------------------
    webUrlHandler = (webUrl) =>{
        console.log('url: ', webUrl);
        window.open(webUrl);
    };

    removePinHandler = (pinId) =>{
        console.log('remove this id', pinId);

        // const 
    }

    render(){
        console.log('state======================', this.state);

        let loading = null;
        if(this.state.loadingIcon){
            loading = <div className='loading'>
                    <FontAwesomeIcon
                        icon={faSpinner}
                        color='#4f4f4f'
                        size='6x'
                        spin/>
                </div>
        }

        let pins = null;
        if(this.state.dbLoaded){
            // render following pins
            if(this.state.followingPins && this.state.followingPins.length){
                console.log('yes if');
                pins = this.state.followingPins.map(pin=>{
                    return <Pin
                        title={pin.title}
                        imageUrl={pin.imageUrl}
                        webUrl={pin.webUrl}
                        key={pin.pinId}
                        onWebUrlClicked={this.webUrlHandler.bind(this, pin.webUrl)}
                        onPinRemoveButtonClicked={this.removePinHandler.bind(this, pin.pinId)}
                    />
                });
            }
            else{
                console.log('no if');
                pins = <p>There are no pins to display</p>;
            }
        }

        return (
            <div className='FollowingPins'>

                {loading}

                <div ref={node => {this.navbarNode = node;}}>
                    <Navbar
                        showMobileNavbar={this.state.showMobileNavbar}
                        clicked={this.toggleMobileNavbar}
                        showModalClicked={this.showModal}
                        logOutClicked={this.logOutHandler}
                    />
                </div>

                <div className="pinsContainer">
                    {pins}
                </div>
            </div>
        )
    }
}

export default FollowingPins;