import {v4 as uuidv4} from 'uuid';

import {RadioChannel} from "./Radio";
import {VoiceClient} from './VoiceClient'
import {VoiceRanges} from "../SaltyShared/SharedData";
import Event from "../SaltyShared/Event";

export class VoiceManager {
    //#region Properties
    public static Instance: VoiceManager;

    public ServerUniqueIdentifier: string;
    public MinimumPluginVersion: string;
    public SoundPack: string;
    public IngameChannel: string;
    public IngameChannelPassword: string;
    public SwissChannels: number[] = [];

    public RadioTowers: Vector3Mp[] =
        [
            new mp.Vector3(552.8169, -27.8083, 94.87936),
            new mp.Vector3(758.5276, 1273.74, 360.2965),
            new mp.Vector3(1857.389, 3694.529, 38.9618),
            new mp.Vector3(-448.2019, 6019.807, 36.62916)
        ];

    public VoiceClients: () => VoiceClient[] = (): VoiceClient[] => {
        return Array.from(this._voiceClients.values());
    };
    private _voiceClients: Map<PlayerMp, VoiceClient> = new Map<PlayerMp, VoiceClient>();


    public RadioChannels: () => RadioChannel[] = (): RadioChannel[] => {
        return this._radioChannels
    }
    private _radioChannels: RadioChannel[] = [];
    //#endregion

    //#region CTOR
    constructor() {
        VoiceManager.Instance = this;
        mp.events.add({
            "sSaltyChat-OnStart": () => {
                this.OnResourceStart();
            },
            "sSaltyChat-OnJoin": (player: PlayerMp) => {
                this.OnPlayerConnected(player);
            },
            "playerQuit": (client: PlayerMp, disconnectionType: string, reason: string) => {
                this.OnPlayerDisconnected(client, disconnectionType, reason);
            }
        })
        mp.events.add(Event.SaltyChat_CheckVersion, this.OnCheckVerion);
        mp.events.add(Event.SaltyChat_SetVoiceRange, this.OnSetVoiceRange);
        mp.events.add(Event.SaltyChat_IsSending, this.OnSendingOnRadio);
    }

    //#endregion

    //#region Server Events
    public void

    OnResourceStart(): void {
        this.ServerUniqueIdentifier = "ciGfYS6rTVThOtNNBAh4ssxdb3o=";
        this.MinimumPluginVersion = "";
        this.SoundPack = "default";
        this.IngameChannel = "3";
        this.IngameChannelPassword = "5V88FWWME615";

        let swissChannelIds: string = "";

        if (swissChannelIds !== null || swissChannelIds.length !== 0) {
            this.SwissChannels = swissChannelIds.split(',').map(str => parseInt(str));
        }
    }

    OnPlayerConnected(client: PlayerMp): void {
        let voiceClient: VoiceClient;

        voiceClient = new VoiceClient(client, this.GetTeamSpeakName(), VoiceRanges[1]);
        this._voiceClients.set(client, voiceClient);

        client.call(Event.SaltyChat_Initialize,
            [voiceClient.TeamSpeakName,
                this.ServerUniqueIdentifier,
                this.SoundPack,
                this.IngameChannel,
                this.IngameChannelPassword]);

        this.VoiceClients().forEach((cl: VoiceClient) => {
            client.call(Event.SaltyChat_UpdateClient, [cl.Player.id, cl.TeamSpeakName, cl.VoiceRange]);
            cl.Player.call(Event.SaltyChat_UpdateClient, [voiceClient.Player.id, voiceClient.TeamSpeakName, voiceClient.VoiceRange]);
        })
    }

    OnPlayerDisconnected(client: PlayerMp, disconnectionType: string, reason: string): void {
        let voiceClient: VoiceClient = this._voiceClients.get(client);
        if (voiceClient == null)
            return;

        this._voiceClients.delete(client);

        this.RadioChannels().filter(c => c.IsMember(voiceClient)).forEach((radioChannel: RadioChannel) => {
            radioChannel.RemoveMember(voiceClient);
        })
        this.VoiceClients().forEach((cl: VoiceClient) => {
            cl.Player.call(Event.SaltyChat_Disconnected, [voiceClient.Player.id]);
        })
    }

    //#endregion

    // #region Remote Events
    OnCheckVerion(player: PlayerMp, version: string) {
        let voiceClient: VoiceClient = this._voiceClients.get(player);
        if (voiceClient == null)
            return;

        if (!this.IsVersionAccepted(version)) {
            player.kick(`[Salty Chat] Required Version: ${this.MinimumPluginVersion}`);
            return;
        }
    }

    OnSetVoiceRange(player: PlayerMp, voiceRange: number) {
        let voiceClient: VoiceClient = this._voiceClients.get(player);
        if (voiceClient == null)
            return;

        if (VoiceRanges.indexOf(voiceRange) >= 0) {
            voiceClient.VoiceRange = voiceRange;

            this.VoiceClients().forEach((client: VoiceClient) => {
                client.Player.call(Event.SaltyChat_SetVoiceRange, [client.Player.id, client.VoiceRange])
            })

        }
    }

    // #endregion

    // #region Remote Events (Radio)
    OnSendingOnRadio(player: PlayerMp, radioChannelName: string, isSending: boolean) {
        let voiceClient: VoiceClient = this._voiceClients.get(player);
        if (voiceClient == null)
            return;
        let radioChannel: RadioChannel = this.GetRadioChannel(radioChannelName, false);
        if (radioChannel == null || !radioChannel.IsMember(voiceClient))
            return
        radioChannel.Send(voiceClient, isSending);
    }

    // #endregion

    //#region Methods (Radio)
    GetRadioChannel(name: string, create: Boolean): RadioChannel {
        let radioChannel: RadioChannel;

        radioChannel = this.RadioChannels().find(r => r.Name == name);
        if (radioChannel == null && create) {
            radioChannel = new RadioChannel(name);
            this._radioChannels.push(radioChannel)
        }
        return radioChannel;
    }

    SetRadioSpeaker(player: PlayerMp, toggle: boolean) {
        let voiceClient: VoiceClient = this._voiceClients.get(player);
        if (voiceClient == null)
            return;

        voiceClient.RadioSpeaker = toggle;
    }

    JoinRadioChannel(player: PlayerMp, radioChannelName: string) {
        let voiceClient: VoiceClient = this._voiceClients.get(player);
        if (voiceClient == null)
            return;

        this.RadioChannels().forEach((channel: RadioChannel) => {
            if (channel.IsMember(voiceClient))
                return;
        })

        const radioChannel: RadioChannel = this.GetRadioChannel(radioChannelName, true);
        radioChannel.AddMember(voiceClient);
    }

    LeaveRadioChannel(player: PlayerMp): void {
        let voiceClient: VoiceClient = this._voiceClients.get(player);
        if (voiceClient == null)
            return;

        this.RadioChannels().filter(r => r.IsMember(voiceClient)).forEach((radioChannel: RadioChannel) => {
            this.LeaveRadioChannelWithName(player, radioChannel.Name);
        });
    }

    LeaveRadioChannelWithName(player: PlayerMp, radioChannelName: string): void {
        let voiceClient: VoiceClient = this._voiceClients.get(player);
        if (voiceClient == null)
            return;

        const radioChannel: RadioChannel = this.GetRadioChannel(radioChannelName, false);
        if(radioChannel != null) {
            radioChannel.RemoveMember(voiceClient);
            if(radioChannel.Members.length == 0) {
                const index = this._radioChannels.indexOf(radioChannel);
                if(index > -1) {
                    this._radioChannels.splice(index, 1);
                }
            }
        }
    }

    SendingOnRadio(player: PlayerMp, radioChannelName: string, isSending: boolean) {
        let voiceClient: VoiceClient = this._voiceClients.get(player);
        if (voiceClient == null)
            return;

        const radioChannel: RadioChannel = this.GetRadioChannel(radioChannelName, false);
        if(radioChannel == null || !radioChannel.IsMember(voiceClient))
            return;
        radioChannel.Send(voiceClient, isSending)
    }
    // #endregion

    //#region Methods
    GetTeamSpeakName(): string {
        let name: string;
        do {
            let uuid = uuidv4()
            name = uuid.replace("-", "");
            console.log("uuid", uuidv4())
            console.log(name);
            if (name.length > 30) {
                name = name.slice(0, 29);
            }
            console.log(name);
        } while (Array.from(this._voiceClients.values()).find(c => c.TeamSpeakName == name));
        return name;
    }

    IsVersionAccepted(version: string): boolean {
        if (!this.isNullOrWhitespace(this.MinimumPluginVersion)) {
            let minimumVersionArray: string[] = this.MinimumPluginVersion.split('.');
            let versionArray: string[] = version.split('.');

            let lengthCounter: number = 0;

            if (versionArray.length >= minimumVersionArray.length) {
                lengthCounter = minimumVersionArray.length;
            } else {
                lengthCounter = versionArray.length
            }

            for (let i: number; i < lengthCounter; i++) {
                const min: number = parseInt(minimumVersionArray[i]);
                const cur: number = parseInt(versionArray[i]);

                if (cur > min) {
                    return true;
                } else if (min > cur) {
                    return false;
                }
            }
        }
        return true;
    }

    //#endregion
    //#region Helper
    isNullOrWhitespace(input) {
        return !input || !input.trim();
    }
    //#endregion
}
