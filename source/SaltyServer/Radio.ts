"use strict";
import {VoiceClient} from "./VoiceClient";
import {VoiceManager} from "./VoiceManager";
import Event from "../SaltyShared/Event";
import {VoiceRanges} from "../SaltyShared/SharedData";

export class RadioChannel {
    Name: string
    Members: RadioChannelMember[]

    constructor(name: string, members: RadioChannelMember[] = null) {
        this.Name = name;
        if (members != null)
            this.Members.concat(members);
    }

    IsMember(voiceClient: VoiceClient): boolean {
        return this.Members.some(m => m.VoiceClient == voiceClient);
    }

    AddMember(voiceClient: VoiceClient): void {
        if (!this.Members.some(m => m.VoiceClient == voiceClient)) {
            this.Members.push(new RadioChannelMember(this, voiceClient));

            voiceClient.Player.call("SaltyChat_SetRadioChannel", [this.Name]);

            this.Members.filter(m => m.IsSending).forEach((member: RadioChannelMember) => {
                voiceClient.Player.call("SaltyChat_IsSending", [member.VoiceClient.Player.id, true, false]);
            })
        }
    }

    RemoveMember(voiceClient: VoiceClient): void {
        let member: RadioChannelMember = this.Members.find(m => m.VoiceClient == voiceClient);
        if (member != null) {
            if (member.IsSending) {
                if (member.VoiceClient.RadioSpeaker) {
                    VoiceManager.Instance.VoiceClients().forEach((client: VoiceClient) => {
                        client.Player.call(Event.SaltyChat_IsSendingRelayed, [voiceClient.Player.id, false, true, false, "{}"])
                    })
                } else {
                    this.Members.forEach((channelMember: RadioChannelMember) => {
                        channelMember.VoiceClient.Player.call(Event.SaltyChat_IsSending, [voiceClient.Player.id, false, true])
                    })
                }
            }

            const index = this.Members.indexOf(member);
            if (index > -1) {
                this.Members.splice(index, 1);
            }
            voiceClient.Player.call(Event.SaltyChat_SetRadioChannel, [""]);

            this.Members.filter(m => m.IsSending).forEach((channelMember: RadioChannelMember) => {
                voiceClient.Player.call(Event.SaltyChat_IsSending, [channelMember.VoiceClient.Player.id, false, false])
            });
        }
    }

    Send(voiceClient: VoiceClient, isSending: boolean): void {
        let radioChannelMember: RadioChannelMember = this.Members.find(m => m.VoiceClient == voiceClient);
        if (radioChannelMember == null)
            return;

        let stateChanged = radioChannelMember.IsSending != isSending;
        radioChannelMember.IsSending = isSending;

        let channelMember: RadioChannelMember[] = this.Members;
        let onSpeaker: RadioChannelMember[] = channelMember.filter(m => m.VoiceClient.RadioSpeaker && m.VoiceClient != voiceClient);

        if(onSpeaker.length > 0) {
            let channelMemberNames: string[] = onSpeaker.map(m => m.VoiceClient.TeamSpeakName);
            VoiceManager.Instance.VoiceClients().forEach((remoteClient: VoiceClient) => {
                remoteClient.Player.call(Event.SaltyChat_IsSendingRelayed, [voiceClient.Player.id, isSending, stateChanged, this.IsMember(remoteClient), JSON.stringify(channelMemberNames)]);
            })
        } else {
            channelMember.forEach((member: RadioChannelMember) => {
                member.VoiceClient.Player.call(Event.SaltyChat_IsSending, [voiceClient.Player.id, isSending, stateChanged])
            })
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
