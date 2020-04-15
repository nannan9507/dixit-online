/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './board.css';
import { PreviousRound } from "../previous-round/previous-round";

export class DixitBoard extends React.Component {
    static propTypes = {
        G: PropTypes.any.isRequired,
        ctx: PropTypes.any.isRequired,
        moves: PropTypes.any.isRequired,
        playerID: PropTypes.string,
        isActive: PropTypes.bool,
        isMultiplayer: PropTypes.bool,
    };
    state = {
        message: '',
    };

    onClick = id => {
        if (!this.props.isActive) {
            this.promptMessage('IT IS NOT YOUR TURN !!!');
            return;
        }
        if (this.isMasterPlayer(this.props.ctx, this.props.playerID)) {
            this.props.moves.SetMasterCard(id);
        } else if (this.isTrickingPlayer(this.props.ctx, this.props.playerID)) {
            this.props.moves.TrickCard(id, this.props.playerID);
        }
    };

    vote = id => {
        if (!this.props.isActive) {
            this.promptMessage('IT IS NOT YOUR TURN !!!');
            return;
        }
        const cardIds = this.getCardIds();
        if (cardIds.includes(id)) {
            this.promptMessage('CAN NOT CHOOSE YOUR OWN CARD !!!');
            return;
        }
        this.props.moves.VoteOnCard(id, this.props.playerID);
    }

    isMasterPlayer(ctx, id) {
        return ctx.activePlayers && ctx.activePlayers[id] === 'masterChooser';
    }

    isTrickingPlayer(ctx, id) {
        return ctx.activePlayers && ctx.activePlayers[id] === 'trickChooser';
    }

    isVotingPlayer(ctx, id) {
        return ctx.activePlayers && ctx.activePlayers[id] === 'vote';
    }

    isVoteStage() {
        return this.props.ctx.activePlayers && Object.values(this.props.ctx.activePlayers)
            .every(stage => stage === 'vote');
    }

    getCardURL(id) {
        return `/assets/img/cards/card_${id.toString().padStart(5, '0')}.jpg`;
    }

    getCardIds() {
        const playerID = +this.props.playerID;
        return this.props.G.cards.filter((card, idx) => (idx >= playerID * this.props.G.cardsInHandNr) && (idx < (playerID + 1) * this.props.G.cardsInHandNr));
    }

    getScores() {
        return JSON.stringify(this.props.G.scores);
    }

    getCurrentPlayerName() {
        return this.props.gameMetadata.find(player => +player.id === +this.props.playerID).name;
    }

    promptMessage(message) {
        this.setState({
            message,
        });
        setTimeout(() => {
            this.setState({
                message: '',
            });
        }, 3000)
    }

    emptyMessage() {
        this.setState({
            message: '',
        });
    }

    render() {
        const name = this.getCurrentPlayerName();
        const scores = this.getScores();
        const cardIds = this.getCardIds();

        return (
            <div>
                {this.state.message && <div className="jqbox_overlay" onClick={this.emptyMessage.bind(this)}></div>}
                {this.state.message && <h1 className="jqbox_innerhtml">{this.state.message}</h1>}
                <pre>Hi, {name}</pre>
                <pre>Scores: {scores}</pre>
                <pre>Turn nr: {this.props.ctx.turn}</pre>
                {this.props.isActive && <h1>Choose a card!</h1>}
                {this.isVoteStage() && <div>
                    <h1>LET'S VOTE</h1>
                    {this.props.G.cardsToVoteFor.map(id => <img key={id} className="card" src={this.getCardURL(id)} onClick={this.vote.bind(this, id)}/>)}
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                </div>}
                {cardIds.map(id => <img key={id} className="card" src={this.getCardURL(id)} onClick={this.onClick.bind(this, id)}/>)}
                {this.props.G.previousRound && <PreviousRound previousRound={this.props.G.previousRound} players={this.props.gameMetadata}/>}
            </div>
        );
    }
}