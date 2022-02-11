import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import { BiSend } from 'react-icons/bi';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';


// Como fazer AJAX: https://medium.com/@omariosouto/entendendo-como-fazer-ajax-com-a-fetchapi-977ff20da3c6
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjeHhvaWxldG5tdGRqYXdscm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDQzNDA2ODEsImV4cCI6MTk1OTkxNjY4MX0.ir9iQNgFl5yVpFLoHp3rAueKx1RoOcMB4Y2iJ1o-cWA';
const SUPABASE_URL = 'https://zcxxoiletnmtdjawlrmq.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
      .from('mensagens')
      .on('INSERT', (respostaLive) => {
        adicionaMensagem(respostaLive.new);
      })
      .subscribe();
  }

export default function ChatPage() {
    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;
    console.log('roteamento.query', roteamento.query);
    console.log('usuarioLogado', usuarioLogado);
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagens, setListaDeMensagens] = React.useState([]);

    React.useEffect(() => {
        supabaseClient
          .from('mensagens')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            console.log('Dados da consulta:', data);
            setListaDeMensagens(data);
          });

          const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
            console.log('Nova mensagem:', novaMensagem);
            console.log('listaDeMensagens:', listaDeMensagens);
            // Quero reusar um valor de referencia (objeto/array) 
            // Passar uma função pro setState
      
            // setListaDeMensagens([
            //     novaMensagem,
            //     ...listaDeMensagens
            // ])
            setListaDeMensagens((valorAtualDaLista) => {
              console.log('valorAtualDaLista:', valorAtualDaLista);
              return [
                novaMensagem,
                ...valorAtualDaLista,
              ]
            });
          });
      
          return () => {
            subscription.unsubscribe();
          }
      }, []);

    /*
    // Usuário
    - Usuário digita no campo textarea
    - Aperta enter para enviar
    - Tem que adicionar o texto na listagem
    
    // Dev
    - [X] Campo criado
    - [X] Vamos usar o onChange usa o useState (ter if pra caso seja enter pra limpar a variavel)
    - [X] Lista de mensagens 
    */
    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
           // id: listaDeMensagens.length + 1,
            de: usuarioLogado,
            texto: novaMensagem,
        };

        supabaseClient
        .from('mensagens')
        .insert([
          // Tem que ser um objeto com os MESMOS CAMPOS que você escreveu no supabase
          mensagem
        ])
        .then(({ data }) => {
          console.log('Criando mensagem: ', data);
         /*  setListaDeMensagens([
            data[0],
            ...listaDeMensagens,
          ]); */
        });
  
      setMensagem('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/12/bright-gaming-room-setup-768x432.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.transparent.fundo,
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.transparent.fundo,
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    <MessageList mensagens={listaDeMensagens} />
                    {/* {listaDeMensagens.map((mensagemAtual) => {
                    return (
                        <li key={mensagemAtual.id}>
                            {mensagemAtual.de}: {mensagemAtual.texto}
                        </li>
                    )
                })} */}
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    if (mensagem.length > 0) {
                                        handleNovaMensagem(mensagem);
                                    }
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.transparent.fundo,
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        {/*CallBack */}
                        <ButtonSendSticker 
                            onStickerClick={(sticker) => {
                                handleNovaMensagem(`:sticker: ${sticker}`);
                            }}
                        />
                        <Button
                            variant='tertiary'
                            label={< BiSend />}
                            type='submit'
                            styleSheet={{
                                borderRadius: '5px',
                                backgroundColor: appConfig.theme.colors.transparent.buttonN,
                                marginLeft: '10px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                            buttonColors={{
                                mainColorLight: appConfig.theme.colors.transparent.buttonC,
                            }}
                            onClick={(event) => {
                                event.preventDefault();
                                if (mensagem.length > 0) {
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    label='Logout'
                    href="/"
                    styleSheet={{
                        borderRadius: '5px',
                        backgroundColor: appConfig.theme.colors.transparent.buttonN,
                        marginLeft: '10px',
                        color: appConfig.theme.colors.neutrals[200],
                    }}
                    buttonColors={{
                        mainColorLight: appConfig.theme.colors.transparent.buttonC,
                    }}
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    console.log(props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                            />
                            <Text tag="strong">
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {mensagem.texto.startsWith(':sticker:')? (<Image src={mensagem.texto.replace(':sticker:', '')} />
                        ):(mensagem.texto) }
                        
                    </Text>
                );
            })}
        </Box>
    )
}