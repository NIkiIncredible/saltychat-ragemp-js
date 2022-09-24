"use strict";
import {VoiceClient} from "./VoiceClient";
export class RadioChannel {
    private readonly Name: string
    private Members: RadioChannelMember[]

    constructor(name: string, members: RadioChannelMember[]) {
        this.Name = name;
        if (members != null)
            this.Members.concat(members);
    }

    IsMember(voiceClient: VoiceClient): boolean {
        return this.Members.some(m => m.VoiceClient == voiceClient);
    }

    AddMember(voiceClient: VoiceClient) {
        if (!this.Members.some(m => m.VoiceClient == voiceClient)) {
            this.Members.push(new RadioChannelMember(this, voiceClient));

            voiceClient.Player.call("SaltyChat_SetRadioChannel", [this.Name]);

            this.Members.filter(m => m.IsSending).forEach((member: RadioChannelMember) => {
                voiceClient.Player.call("SaltyChat_IsSending", [member.VoiceClient.Player.id, true, false]);
            })
        }
    }

    RemoveMember(voiceClient: VoiceClient) {
        let member: RadioChannelMember = this.Members.find(m => m.VoiceClient == voiceClient);
        if(member != null) {
            if (member.IsSending) {
                if(member.VoiceClient.RadioSpeaker) {
                    //RADIO 66
                }
            }
        }
    }
}

class RadioChannelMember {
    get IsSending(): boolean {
        return this._IsSending;
    }

    set IsSending(value: boolean) {
        this._IsSending = value;
    }

    get VoiceClient(): VoiceClient {
        return this._VoiceClient;
    }

    get RadioChannel(): RadioChannel {
        return this._RadioChannel;
    }

    private _RadioChannel: RadioChannel;
    private _VoiceClient: VoiceClient;
    private _IsSending: boolean

    constructor(radioChannel: RadioChannel, voiceClient: VoiceClient) {
        this._RadioChannel = radioChannel;
        this._VoiceClient = voiceClient;
    }
}
