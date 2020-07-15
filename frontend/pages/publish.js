import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import { Menu, Message, Icon, Button, Grid } from 'semantic-ui-react';
import IPFS from 'ipfs-http-client';
import Loader from 'react-loader-spinner';
import buffer from 'buffer';
import GatewayContractObjSetup from '../utils/GatewayConstructor';

const Publish = () => {
  const [{ dapp }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('');
  const [filehash, setFilehash] = useState('');
  const [errorMessage, setError] = useState('');
  const GatewayContractObj = GatewayContractObjSetup(dapp.web3);

  const uploadToIPFS = async () => {
    setLoading(true);
    const data = new FormData();
    const file = document.getElementById('data_file').files[0];
    data.append('file', file);
    setFilename(file.name);
    fetch('http://localhost:8888/api/ipfs', {
      body: data,
      method: 'POST'
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setFilehash(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      });
  };

  const ping = async () => {
    try {
      fetch('http://localhost:8888/api/ping')
        .then((res) => res.json())
        .then((res) => console.log(res));
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const enterGateway = async () => {
    try {
      await GatewayContractObj.methods
        .createSimple()
        .send({ from: dapp.address })
        .on('transactionHash', (hash) => {
          dispatch({
            type: 'SET_CURRENTLY_MINING',
            payload: true
          });
        })
        .on('receipt', (hash) => {
          dispatch({
            type: 'SET_CURRENTLY_MINING',
            payload: false
          });
        });
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && (
        <Message error header="Oops!" content={errorMessage} />
      )}
      <Grid centered columns={2}>
        <Grid.Column>
          <div style={{ marginTop: '100px' }}>
            <hr />
            <h3>
              1. Create your smart contract (non-functioning, will be hidden if
              contract is already created)
            </h3>
            <br />
            <div>
              {' '}
              First, a prompt if you don't already have a smart contract
              launched via our smart contract, we will auto detect this based on
              the address you are using when you land on the site.
            </div>
            <br />
            <Button onClick={enterGateway}>
              Create your own smart contract on Pay3!
            </Button>
            <br />
            <hr />
            <h3>2. Upload some piece of data to IPFS</h3>

            <br />
            <input
              id='data_file'
              type='file'
              style={{ display: 'none' }}
              onChange={uploadToIPFS}
            />
            <label htmlFor='data_file'>
              <div
                id='uploadarea file-field input-field'
                className='ui basic button'
                style={{
                  borderRadius: '250px',
                  width: '250px',
                  height: '250px',
                  border: '3px solid white',
                  paddingTop: '75px',
                  textAlign: 'center'
                }}
              >
                <Icon
                  style={{ margin: 'auto', color: 'white' }}
                  name='add'
                  size='huge'
                />
                <br />
                <br />
                <br />
                <p style={{ color: 'white', fontSize: '18px' }}>Upload File</p>
              </div>
            </label>
            <br />
            <br />
            <div id='ipfsdata'>
              {loading === true ? (
                <>
                  <Loader
                    type='Grid'
                    color='#fcfcfc'
                    height={100}
                    width={100}
                    timeout={10000} //3 secs
                  />
                </>
              ) : (
                ''
              )}
              {filehash !== '' ? (
                <>
                  <div id='name'>Name: {filename}</div>
                  <div id='name'>IPFS HASH: {filehash}</div>
                  <div id='link'>
                    Link to file:{' '}
                    <a
                      target='_blank'
                      rel='no-follow'
                      href={`https://cloudflare-ipfs.com/ipfs/${filehash}`}
                    >
                      LINK
                    </a>
                  </div>
                </>
              ) : (
                ''
              )}
            </div>
            <br />
            <br />
            <hr />
            <h3>
              3. Store that piece of data in your smart contract
              (non-functioning)
            </h3>
            <br />
            <div>
              {' '}
              Then some button here to push that information to your smart
              contract, that will house all of your IPFS hashes.
            </div>
            <Button>Upload this file to your smart contract!</Button>
          </div>
        </Grid.Column>
      </Grid>
    </Layout>
  );
};

export default Publish;